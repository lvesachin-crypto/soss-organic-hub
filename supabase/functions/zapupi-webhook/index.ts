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
    return json({ ok: true, result: data })
  } catch (e) {
    console.error('webhook error', e)
    return json({ ok: true, error: String((e as Error).message || e) })
  }
})

export async function verifyOrder(orderId: string): Promise<{ success: boolean; txn_id?: string; utr?: string; raw: any }> {
  const form = new URLSearchParams()
  form.append('zap_key', ZAPUPI_KEY)
  form.append('order_id', orderId)
  const r = await fetch('https://pay.zapupi.com/api/order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const text = await r.text()
  let data: any = {}
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  const statusStr = String(
    data?.status ?? data?.data?.status ?? data?.payment_status ?? ''
  ).toLowerCase()
  const success =
    statusStr === 'success' ||
    statusStr === 'completed' ||
    statusStr === 'paid' ||
    data?.success === true

  const txn_id = data?.txn_id || data?.data?.txn_id || data?.transaction_id
  const utr = data?.utr || data?.data?.utr || data?.upi_txn_id
  return { success, txn_id, utr, raw: data }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}