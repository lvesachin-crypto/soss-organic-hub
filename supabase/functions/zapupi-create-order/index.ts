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
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
    if (claimsErr || !claims?.claims?.sub) return json({ error: 'Unauthorized' }, 401)
    const userId = claims.claims.sub as string

    const body = await req.json().catch(() => ({}))
    const amount = Number(body?.amount_inr)
    if (!Number.isFinite(amount) || amount < 50 || amount > 100000) {
      return json({ error: 'Amount must be between ₹50 and ₹100000' }, 400)
    }
    const amountInr = Math.round(amount * 100) / 100

    const origin = (body?.origin as string) || req.headers.get('origin') || 'https://organicsmm.online'
    const successUrl = `${origin}/wallet?status=success&order_id=`
    const failedUrl = `${origin}/wallet?status=failed&order_id=`
    const webhookUrl = `${SUPABASE_URL}/functions/v1/zapupi-webhook`

    const orderId = 'ZAP_' + crypto.randomUUID().replace(/-/g, '')

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { error: insErr } = await admin.from('zapupi_deposits').insert({
      user_id: userId,
      order_id: orderId,
      amount_inr: amountInr,
      status: 'pending',
    })
    if (insErr) return json({ error: 'Failed to create deposit row', detail: insErr.message }, 500)

    // Call ZapUPI
    const gwForm = new URLSearchParams()
    gwForm.append('zap_key', ZAPUPI_KEY)
    gwForm.append('order_id', orderId)
    gwForm.append('amount', amountInr.toFixed(2))
    gwForm.append('redirect_url', successUrl + orderId)
    gwForm.append('webhook_url', webhookUrl)

    const gwRes = await fetch('https://pay.zapupi.com/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: gwForm.toString(),
    })
    const gwText = await gwRes.text()
    let gwData: any = {}
    try { gwData = JSON.parse(gwText) } catch { /* keep text */ }

    const paymentUrl: string | undefined =
      gwData?.payment_url || gwData?.data?.payment_url || gwData?.url || gwData?.upi_url
    const gwStatusOk = (gwData?.status === true || gwData?.status === 'success' || gwData?.success === true || !!paymentUrl)

    if (!gwRes.ok || !gwStatusOk || !paymentUrl) {
      await admin.from('zapupi_deposits').update({
        status: 'failed',
        gateway_response: gwData?.message ? gwData : { raw: gwText },
      }).eq('order_id', orderId)
      return json({ error: 'Gateway error', detail: gwData?.message || gwText }, 502)
    }

    await admin.from('zapupi_deposits').update({
      payment_url: paymentUrl,
      gateway_response: gwData,
    }).eq('order_id', orderId)

    return json({ order_id: orderId, payment_url: paymentUrl })
  } catch (e) {
    return json({ error: 'Internal error', detail: String((e as Error).message || e) }, 500)
  }
})

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}