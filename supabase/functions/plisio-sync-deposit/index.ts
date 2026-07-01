import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const PLISIO_KEY = Deno.env.get('PLISIO_SECRET_KEY')!
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
    const orderId = String(body?.order_id || '')
    if (!orderId) return json({ error: 'order_id required' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: dep } = await admin.from('plisio_deposits')
      .select('*').eq('order_id', orderId).maybeSingle()
    if (!dep) return json({ error: 'Not found' }, 404)
    if (dep.user_id !== userId) return json({ error: 'Forbidden' }, 403)
    if (dep.credited) return json({ credited: true, already: true })

    const invoiceId = dep.invoice_id
    if (!invoiceId) return json({ credited: false, status: dep.status })

    const r = await fetch(`https://api.plisio.net/api/v1/operations/${invoiceId}?api_key=${PLISIO_KEY}`)
    const txt = await r.text()
    let data: any = {}
    try { data = JSON.parse(txt) } catch { data = { raw: txt } }
    const op = data?.data ?? data
    const upstream = String(op?.status || '').toLowerCase()
    const local = mapStatus(upstream)
    const paidInr = Number(op?.source_amount ?? op?.amount)
    const expectedInr = Number(dep.amount_inr)

    if (local === 'completed' && Number.isFinite(paidInr) && Math.abs(paidInr - expectedInr) > 0.01) {
      await admin.from('plisio_deposits').update({
        status: 'mismatch', raw_payload: op,
      }).eq('id', dep.id)
      return json({ credited: false, mismatch: true }, 400)
    }

    await admin.from('plisio_deposits').update({
      status: local,
      pay_currency: op?.currency || dep.pay_currency,
      pay_amount: op?.amount ? Number(op.amount) : dep.pay_amount,
      raw_payload: op,
    }).eq('id', dep.id)

    if (local === 'completed') {
      const { data: cr, error: crErr } = await admin.rpc('credit_wallet_plisio', { p_order_id: orderId })
      if (crErr) return json({ error: crErr.message }, 500)
      return json({ credited: true, result: cr })
    }
    return json({ credited: false, status: local })
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500)
  }
})

function mapStatus(s: string): string {
  if (s === 'completed' || s === 'success' || s === 'mismatch') return 'completed'
  if (s === 'expired') return 'expired'
  if (s === 'error' || s === 'cancelled' || s === 'canceled') return 'failed'
  return 'pending'
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status,
  })
}