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
    const email = (claims.claims.email as string) || ''

    const body = await req.json().catch(() => ({}))
    const amountInr = Number(body?.amount_inr)
    const requested = String(body?.currency || 'USDT_TRX').toUpperCase()

    if (!Number.isFinite(amountInr) || amountInr < 50) return json({ error: 'Minimum ₹50' }, 400)
    if (amountInr > 200000) return json({ error: 'Maximum ₹2,00,000' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Ban check
    const { data: prof } = await admin.from('profiles')
      .select('is_banned').eq('user_id', userId).maybeSingle()
    if (prof?.is_banned) return json({ error: 'Account suspended' }, 403)

    const orderId = 'PL_' + crypto.randomUUID()
    const returnBase = String(body?.origin || 'https://organicsmm.online').replace(/\/+$/, '')

    await admin.from('plisio_deposits').insert({
      user_id: userId,
      order_id: orderId,
      amount_inr: amountInr,
      source_currency: 'INR',
      status: 'pending',
    })

    // Auto-fallback chain
    const chain = Array.from(new Set([requested, 'USDT_TRX', 'TRX', 'LTC', 'BTC', 'USDT', 'ETH']))
    let invoice: any = null
    let lastErr: any = null
    let usedCurrency: string = requested

    for (const cur of chain) {
      const params = new URLSearchParams({
        api_key: PLISIO_KEY,
        source_currency: 'INR',
        source_amount: String(amountInr),
        order_number: orderId,
        order_name: 'Wallet Top-up',
        currency: cur,
        callback_url: `${SUPABASE_URL}/functions/v1/plisio-webhook?json=1`,
        success_url: `${returnBase}/wallet?plisio_order_id=${orderId}&status=success`,
        fail_url: `${returnBase}/wallet?plisio_order_id=${orderId}&status=failed`,
        email,
      })
      const r = await fetch(`https://api.plisio.net/api/v1/invoices/new?${params.toString()}`)
      const txt = await r.text()
      let data: any = {}
      try { data = JSON.parse(txt) } catch { data = { raw: txt } }
      if (data?.status === 'success' && data?.data) {
        invoice = data.data
        usedCurrency = cur
        break
      }
      lastErr = data
      const msg = String(data?.data?.message || data?.message || '').toLowerCase()
      if (!msg.includes('currency') && !msg.includes('disabled') && !msg.includes('unsupported')) break
    }

    if (!invoice) {
      await admin.from('plisio_deposits').update({
        status: 'failed', raw_payload: lastErr,
      }).eq('order_id', orderId)
      return json({ error: 'Gateway error', detail: lastErr }, 502)
    }

    await admin.from('plisio_deposits').update({
      invoice_id: invoice.txn_id || invoice.id || null,
      invoice_url: invoice.invoice_url || null,
      qr_code: invoice.qr_code || null,
      wallet_hash: invoice.wallet_hash || null,
      pay_currency: usedCurrency,
      pay_amount: invoice.invoice_total_sum ? Number(invoice.invoice_total_sum) : (invoice.amount ? Number(invoice.amount) : null),
      raw_payload: invoice,
    }).eq('order_id', orderId)

    return json({
      order_id: orderId,
      invoice_url: invoice.invoice_url,
      qr_code: invoice.qr_code,
      wallet_hash: invoice.wallet_hash,
      pay_amount: invoice.invoice_total_sum || invoice.amount,
      pay_currency: usedCurrency,
      amount_inr: amountInr,
    })
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500)
  }
})

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status,
  })
}