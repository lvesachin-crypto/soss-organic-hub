import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const ZAPUPI_KEY = Deno.env.get('ZAPUPI_ZAP_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Always respond 200 to gateway to prevent retries storm; log errors internally.
  try {
    let payload: any = {}
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      payload = await req.json().catch(() => ({}))
    } else {
      const text = await req.text()
      try { payload = JSON.parse(text) } catch {
        const params = new URLSearchParams(text)
        payload = Object.fromEntries(params.entries())
      }
    }

    const orderId: string | undefined =
      payload?.order_id || payload?.orderId || payload?.data?.order_id
    if (!orderId) {
      return json({ ok: true, note: 'no order_id' })
    }

    // Double-confirm via order-status (NEVER trust webhook payload status)
    const verify = await verifyOrder(orderId)
    if (!verify.success) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
      await admin.from('zapupi_deposits').update({
        gateway_response: { webhook: payload, verify: verify.raw },
      }).eq('order_id', orderId)
      return json({ ok: true, verified: false })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data, error } = await admin.rpc('credit_wallet_zapupi', {
      p_order_id: orderId,
      p_txn_id: verify.txn_id ?? null,
      p_utr: verify.utr ?? null,
      p_gateway_response: { webhook: payload, verify: verify.raw },
    })
    if (error) {
      console.error('credit_wallet_zapupi error', error)
      return json({ ok: true, credit_error: error.message })
    }
    await notifyTelegram(admin, orderId, data, 'webhook').catch((e) => console.error('tg notify', e))
    return json({ ok: true, result: data })
  } catch (e) {
    console.error('webhook error', e)
    return json({ ok: true, error: String((e as Error).message || e) })
  }
})

export async function verifyOrder(orderId: string): Promise<{ success: boolean; txn_id?: string; utr?: string; environment?: string; raw: any }> {
  const r = await fetch('https://pay.zapupi.com/api/order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ zap_key: ZAPUPI_KEY, order_id: orderId }),
  })
  const text = await r.text()
  let data: any = {}
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  // Per ZapUPI spec, the order-status payload is nested under `data`.
  const d = data?.data ?? data
  const orderStatusStr = String(d?.status ?? data?.status ?? '').toLowerCase()
  const success = orderStatusStr === 'success' || orderStatusStr === 'completed' || orderStatusStr === 'paid'
  const txn_id = d?.txn_id || data?.txn_id
  const utr = d?.utr || data?.utr
  const environment = d?.environment || data?.environment
  return { success, txn_id, utr, environment, raw: data }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

async function notifyTelegram(admin: any, orderId: string, creditResult: any, source: 'webhook' | 'sync') {
  if (!creditResult?.credited || creditResult?.duplicate) return
  const { data: dep } = await admin
    .from('zapupi_deposits')
    .select('user_id, amount_inr, txn_id, utr')
    .eq('order_id', orderId)
    .maybeSingle()
  if (!dep) return
  const { data: prof } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('user_id', dep.user_id)
    .maybeSingle()
  const { data: wal } = await admin
    .from('wallets')
    .select('balance')
    .eq('user_id', dep.user_id)
    .maybeSingle()
  const rate = 83.5
  const balInr = wal?.balance ? (Number(wal.balance) * rate).toFixed(2) : '?'
  const msg = [
    `💰 <b>Auto Fund Added (ZapUPI)</b>`,
    ``,
    `👤 <b>User:</b> ${prof?.email ?? dep.user_id}`,
    `💵 <b>Amount:</b> ₹${Number(dep.amount_inr).toFixed(2)}`,
    `🏦 <b>New Balance:</b> ₹${balInr}`,
    `🆔 <b>Order:</b> <code>${orderId}</code>`,
    dep.utr ? `🔁 <b>UTR:</b> <code>${dep.utr}</code>` : '',
    dep.txn_id ? `🧾 <b>Txn:</b> <code>${dep.txn_id}</code>` : '',
    `📡 <b>Source:</b> ${source}`,
  ].filter(Boolean).join('\n')
  await fetch(`${SUPABASE_URL}/functions/v1/send-telegram-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ message: msg, parse_mode: 'HTML' }),
  })
}