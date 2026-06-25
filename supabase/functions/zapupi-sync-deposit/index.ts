import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const ZAPUPI_KEY = Deno.env.get('ZAPUPI_ZAP_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
    if (claimsErr || !claims?.claims?.sub) return json({ error: 'Unauthorized' }, 401)
    const userId = claims.claims.sub as string

    const body = await req.json().catch(() => ({}))
    const orderId: string | undefined = body?.order_id
    if (!orderId) return json({ error: 'order_id required' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: dep, error: depErr } = await admin
      .from('zapupi_deposits')
      .select('id,user_id,credited,status,amount_inr')
      .eq('order_id', orderId)
      .maybeSingle()
    if (depErr || !dep) return json({ error: 'Order not found' }, 404)
    if (dep.user_id !== userId) return json({ error: 'Forbidden' }, 403)
    if (dep.credited) return json({ credited: true, already: true })

    const verify = await verifyOrder(orderId)
    if (!verify.success) {
      await admin.from('zapupi_deposits').update({
        gateway_response: { sync_verify: verify.raw },
      }).eq('order_id', orderId)
      return json({ credited: false, status: verify.statusStr || 'pending' })
    }

    const { data, error } = await admin.rpc('credit_wallet_zapupi', {
      p_order_id: orderId,
      p_txn_id: verify.txn_id ?? null,
      p_utr: verify.utr ?? null,
      p_gateway_response: { sync_verify: verify.raw },
    })
    if (error) return json({ error: error.message }, 500)
    return json({ credited: true, result: data })
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500)
  }
})

async function verifyOrder(orderId: string) {
  const r = await fetch('https://pay.zapupi.com/api/order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ zap_key: ZAPUPI_KEY, order_id: orderId }),
  })
  const text = await r.text()
  let data: any = {}
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  const statusStr = String(
    data?.status ?? data?.data?.status ?? data?.payment_status ?? ''
  ).toLowerCase()
  const success =
    statusStr === 'success' || statusStr === 'completed' || statusStr === 'paid' || data?.success === true
  return {
    success,
    statusStr,
    txn_id: data?.txn_id || data?.data?.txn_id || data?.transaction_id,
    utr: data?.utr || data?.data?.utr || data?.upi_txn_id,
    raw: data,
  }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}