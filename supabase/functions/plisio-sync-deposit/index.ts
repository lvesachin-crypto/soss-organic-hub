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

    let invoiceId = dep.invoice_id
    let op: any = null
    let upstream = ''
    if (invoiceId) {
      const r = await fetch(`https://api.plisio.net/api/v1/operations/${invoiceId}?api_key=${PLISIO_KEY}`)
      const txt = await r.text()
      let data: any = {}
      try { data = JSON.parse(txt) } catch { data = { raw: txt } }
      op = data?.data ?? data
      upstream = String(op?.status || '').toLowerCase()
    }

    // Fallback: Plisio marks duplicate/rapid re-submissions as "cancelled duplicate" and creates
    // a NEW invoice with a different txn_id for the real payment. Search the merchant's operations
    // for a completed invoice with the same amount_inr around this deposit's creation time.
    const needsFallback = !invoiceId || !upstream || upstream.includes('cancel') || upstream === 'new' || upstream === 'expired' || upstream === 'error'
    if (needsFallback) {
      try {
        const listR = await fetch(`https://api.plisio.net/api/v1/operations?api_key=${PLISIO_KEY}&limit=50&type=invoice`)
        const listT = await listR.text()
        const listJ = JSON.parse(listT)
        const ops = listJ?.data?.operations || []
        const depCreated = new Date(dep.created_at).getTime()
        // First: try to find a completed op with source_amount matching amount_inr (±1) within ±30 min
        // Only consider invoice IDs not already tied to another credited/completed deposit
        const opIds = ops.filter((o: any) => String(o?.status).toLowerCase() === 'completed').map((o: any) => o.id)
        let usedIds = new Set<string>()
        if (opIds.length) {
          const { data: taken } = await admin.from('plisio_deposits')
            .select('invoice_id').in('invoice_id', opIds).eq('credited', true)
          usedIds = new Set((taken || []).map((r: any) => r.invoice_id))
        }
        for (const o of ops) {
          if (String(o?.status).toLowerCase() !== 'completed') continue
          if (usedIds.has(o.id)) continue
          // Timestamp proximity from mongo-style id prefix (first 8 hex = unix seconds)
          let createdTs = 0
          try { createdTs = parseInt(String(o.id).slice(0, 8), 16) * 1000 } catch {}
          const withinWindow = !createdTs || Math.abs(createdTs - depCreated) < 30 * 60 * 1000
          if (!withinWindow) continue
          // Fetch detail (best effort)
          const dR = await fetch(`https://api.plisio.net/api/v1/operations/${o.id}?api_key=${PLISIO_KEY}`)
          const dT = await dR.text()
          let dJ: any = {}
          try { dJ = JSON.parse(dT) } catch {}
          const detail = dJ?.data ?? dJ
          op = detail || o
          upstream = 'completed'
          invoiceId = o.id
          await admin.from('plisio_deposits').update({ invoice_id: o.id }).eq('id', dep.id)
          break
        }
      } catch (_) { /* ignore fallback errors */ }
    }

    if (!op) return json({ credited: false, status: dep.status })
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