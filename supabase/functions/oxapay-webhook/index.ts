import { createClient } from 'npm:@supabase/supabase-js@2'

const OXAPAY_KEY = Deno.env.get('OXAPAY_MERCHANT_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Always respond 200 to prevent OxaPay from retrying storms; log everything.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
  const sourceIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null
  let rawBody = ''
  try {
    rawBody = await req.text()
  } catch {
    return new Response('ok', { status: 200 })
  }

  const eventHash = await sha256(rawBody)
  const receivedSig = req.headers.get('hmac') || req.headers.get('HMAC') || ''
  const expectedSig = await hmacSha512Hex(OXAPAY_KEY, rawBody)
  const signatureValid = !!receivedSig && timingSafeEqual(receivedSig.toLowerCase(), expectedSig.toLowerCase())

  let payload: any = {}
  try { payload = JSON.parse(rawBody) } catch { payload = { raw: rawBody } }

  const orderId: string | null = payload?.order_id || payload?.orderId || null
  const trackId: string | null = payload?.track_id ? String(payload.track_id) : (payload?.trackId ? String(payload.trackId) : null)
  const status: string | null = String(payload?.status || payload?.type || '').toLowerCase() || null

  // Idempotency insert (unique event_hash)
  const { error: insertErr } = await admin.from('oxapay_webhook_events').insert({
    event_hash: eventHash,
    order_id: orderId,
    track_id: trackId,
    status,
    signature_valid: signatureValid,
    source_ip: sourceIp,
    payload,
    notes: signatureValid ? null : 'signature_invalid',
  })

  // Duplicate event → return early
  if (insertErr && String(insertErr.message).toLowerCase().includes('duplicate')) {
    return new Response('ok', { status: 200 })
  }

  if (!signatureValid) {
    await admin.from('oxapay_webhook_events').update({ processed: true }).eq('event_hash', eventHash)
    return new Response('ok', { status: 200 })
  }

  if (!orderId) {
    await admin.from('oxapay_webhook_events').update({ processed: true, notes: 'missing_order_id' }).eq('event_hash', eventHash)
    return new Response('ok', { status: 200 })
  }

  // Mirror status onto deposit (via service_role — trigger allows it)
  const isPaid = status && ['paid', 'confirmed', 'completed', 'success'].includes(status)
  const updatePatch: Record<string, unknown> = {
    raw_payload: payload,
    status: status || 'waiting',
  }
  if (payload?.pay_currency) updatePatch.pay_currency = payload.pay_currency
  if (payload?.currency && !payload?.pay_currency) updatePatch.pay_currency = payload.currency
  if (trackId) updatePatch.track_id = trackId

  await admin.from('oxapay_deposits').update(updatePatch).eq('order_id', orderId)

  let creditResult: any = null
  if (isPaid) {
    const { data, error } = await admin.rpc('credit_wallet_oxapay', { p_order_id: orderId })
    creditResult = error ? { error: error.message } : data
  }

  await admin.from('oxapay_webhook_events').update({
    processed: true,
    credit_result: creditResult,
  }).eq('event_hash', eventHash)

  return new Response('ok', { status: 200 })
})

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha512Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}