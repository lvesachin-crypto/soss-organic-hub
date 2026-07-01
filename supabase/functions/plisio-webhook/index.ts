import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createHash, createHmac } from 'node:crypto'

const PLISIO_KEY = Deno.env.get('PLISIO_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
  const rawBody = await req.text()
  const eventHash = createHash('sha256').update(rawBody).digest('hex')
  const sourceIp = req.headers.get('x-forwarded-for') || ''

  let payload: any = {}
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      payload = JSON.parse(rawBody)
    } else {
      const params = new URLSearchParams(rawBody)
      payload = Object.fromEntries(params.entries())
    }
  } catch {
    payload = { raw: rawBody }
  }

  // Verify signature (HMAC SHA1 of sorted payload minus verify_hash, keyed by API key)
  const signatureValid = verifyPlisioSignature(payload, PLISIO_KEY)

  const orderId = String(payload?.order_number || '')
  const invoiceId = String(payload?.txn_id || payload?.id || '')
  const upstreamStatus = String(payload?.status || '').toLowerCase()

  // Replay guard: unique event_hash
  const { data: claim, error: claimErr } = await admin.from('plisio_webhook_events').insert({
    event_hash: eventHash,
    order_id: orderId || null,
    invoice_id: invoiceId || null,
    status: upstreamStatus || null,
    signature_valid: signatureValid,
    source_ip: sourceIp,
    payload,
  }).select('id').maybeSingle()

  if (claimErr && (claimErr as any).code === '23505') {
    return ok({ replay: true })
  }
  if (claimErr) {
    return ok({ error: 'audit_insert_failed', detail: claimErr.message })
  }

  if (!signatureValid) {
    await notifyTelegram(`❌ <b>Plisio bad signature</b>\nOrder: <code>${orderId || 'unknown'}</code>`)
    await admin.from('plisio_webhook_events').update({
      processed: true, notes: 'bad_signature',
    }).eq('id', claim!.id)
    return ok({ ok: true, signature: 'invalid' })
  }

  if (!orderId) {
    await admin.from('plisio_webhook_events').update({ processed: true, notes: 'no_order_id' }).eq('id', claim!.id)
    return ok({ ok: true })
  }

  const { data: dep } = await admin.from('plisio_deposits')
    .select('*').eq('order_id', orderId).maybeSingle()

  if (!dep) {
    await admin.from('plisio_webhook_events').update({ processed: true, notes: 'unknown_order' }).eq('id', claim!.id)
    return ok({ ok: true })
  }

  // Amount match (INR)
  const paidInr = Number(payload?.source_amount ?? payload?.amount)
  const expectedInr = Number(dep.amount_inr)
  const localStatus = mapStatus(upstreamStatus)

  if (Number.isFinite(paidInr) && (localStatus === 'completed') && Math.abs(paidInr - expectedInr) > 0.01) {
    await admin.from('plisio_deposits').update({
      status: 'mismatch',
      raw_payload: payload,
    }).eq('id', dep.id)
    await notifyTelegram(
      `🚨 <b>Plisio amount mismatch</b>\nOrder: <code>${orderId}</code>\nExpected: ₹${expectedInr}\nPaid: ₹${paidInr}`
    )
    await admin.from('plisio_webhook_events').update({ processed: true, notes: 'amount_mismatch' }).eq('id', claim!.id)
    return ok({ ok: true, mismatch: true })
  }

  await admin.from('plisio_deposits').update({
    status: localStatus,
    pay_currency: payload?.currency || dep.pay_currency,
    pay_amount: payload?.amount ? Number(payload.amount) : dep.pay_amount,
    invoice_id: invoiceId || dep.invoice_id,
    raw_payload: payload,
  }).eq('id', dep.id)

  let creditResult: any = null
  if (localStatus === 'completed') {
    const { data: cr, error: crErr } = await admin.rpc('credit_wallet_plisio', { p_order_id: orderId })
    creditResult = crErr ? { error: crErr.message } : cr
    if (!crErr && (cr as any)?.credited) {
      await notifyDeposit(admin, orderId, 'webhook')
    } else if (crErr) {
      await notifyTelegram(`⚠️ <b>Plisio credit RPC error</b>\nOrder: <code>${orderId}</code>\n${crErr.message}`)
    }
  } else if (localStatus === 'expired' || localStatus === 'failed') {
    await notifyTelegram(`⌛ <b>Plisio ${localStatus}</b>\nOrder: <code>${orderId}</code>\nAmount: ₹${expectedInr}`)
  }

  await admin.from('plisio_webhook_events').update({
    processed: true, credit_result: creditResult, notes: localStatus,
  }).eq('id', claim!.id)

  return ok({ ok: true })
})

function ok(b: unknown) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
  })
}

function mapStatus(s: string): string {
  if (s === 'completed' || s === 'success' || s === 'mismatch') return 'completed'
  if (s === 'expired') return 'expired'
  if (s === 'error' || s === 'cancelled' || s === 'canceled') return 'failed'
  return 'pending'
}

function verifyPlisioSignature(payload: any, apiKey: string): boolean {
  try {
    const verifyHash = payload?.verify_hash
    if (!verifyHash || typeof payload !== 'object') return false
    const copy: any = { ...payload }
    delete copy.verify_hash
    const sortedKeys = Object.keys(copy).sort()
    const sorted: any = {}
    for (const k of sortedKeys) sorted[k] = copy[k]
    const jsonSerialized = JSON.stringify(sorted)
    // Plisio docs vary between PHP-style and JSON-style serialization,
    // and between HMAC-SHA1 / HMAC-MD5 / plain MD5. Accept any match.
    const candidates = [
      createHmac('sha1', apiKey).update(jsonSerialized).digest('hex'),
      createHmac('md5',  apiKey).update(jsonSerialized).digest('hex'),
      createHash('md5').update(jsonSerialized + apiKey).digest('hex'),
      createHash('md5').update(apiKey + jsonSerialized).digest('hex'),
    ]
    // PHP-serialize-ish flat concat: key=value pairs joined
    const flat = sortedKeys.map((k) => `${k}=${typeof sorted[k] === 'object' ? JSON.stringify(sorted[k]) : String(sorted[k])}`).join('&')
    candidates.push(
      createHmac('sha1', apiKey).update(flat).digest('hex'),
      createHmac('md5',  apiKey).update(flat).digest('hex'),
    )
    return candidates.includes(String(verifyHash).toLowerCase())
  } catch {
    return false
  }
}

async function notifyTelegram(message: string) {
  await fetch(`${SUPABASE_URL}/functions/v1/send-telegram-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({ message, parse_mode: 'HTML' }),
  }).catch(() => {})
}

async function notifyDeposit(admin: any, orderId: string, source: string) {
  const { data: dep } = await admin.from('plisio_deposits')
    .select('user_id, amount_inr, pay_currency, pay_amount, invoice_id')
    .eq('order_id', orderId).maybeSingle()
  if (!dep) return
  const { data: prof } = await admin.from('profiles')
    .select('email').eq('user_id', dep.user_id).maybeSingle()
  const { data: wal } = await admin.from('wallets')
    .select('balance').eq('user_id', dep.user_id).maybeSingle()
  const balInr = wal?.balance ? (Number(wal.balance) * 90).toFixed(2) : '?'
  const msg = [
    `🪙 <b>Crypto Fund Added (Plisio)</b>`, ``,
    `👤 <b>User:</b> ${prof?.email ?? dep.user_id}`,
    `💵 <b>Amount:</b> ₹${Number(dep.amount_inr).toFixed(2)}`,
    `🏦 <b>New Balance:</b> ₹${balInr}`,
    dep.pay_currency ? `🔗 <b>Currency:</b> ${dep.pay_currency} (${dep.pay_amount})` : '',
    `🆔 <b>Order:</b> <code>${orderId}</code>`,
    dep.invoice_id ? `🧾 <b>Invoice:</b> <code>${dep.invoice_id}</code>` : '',
    `📡 <b>Source:</b> ${source}`,
  ].filter(Boolean).join('\n')
  await notifyTelegram(msg)
}