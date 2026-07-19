import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supa = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function callProviderAdd(provider: any, providerServiceId: string, link: string, qty: number) {
  const body = new URLSearchParams({
    key: provider.api_key,
    action: 'add',
    service: String(providerServiceId),
    link,
    quantity: String(qty),
  });
  const res = await fetch(provider.api_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`Non-JSON response: ${text.slice(0, 200)}`); }
  if (json.error) throw new Error(String(json.error));
  if (!json.order) throw new Error(`No order id in response: ${text.slice(0, 200)}`);
  return String(json.order);
}

async function processOrder(orderId: string) {
  // Lock order via update to 'dispatching'
  const { data: order, error: fetchErr } = await supa
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (fetchErr || !order) return { orderId, ok: false, error: 'not found' };
  if (!['pending', 'queued'].includes(order.status)) return { orderId, ok: false, error: 'wrong status' };

  const { data: mappings } = await supa
    .from('service_provider_mapping')
    .select('*, provider:providers(*)')
    .eq('service_id', order.service_id)
    .eq('is_active', true)
    .order('priority');

  if (!mappings?.length) {
    await supa.from('orders').update({ status: 'failed', error_message: 'No providers mapped' }).eq('id', orderId);
    return { orderId, ok: false, error: 'no providers' };
  }

  const tried: string[] = order.tried_providers ?? [];
  const attempts: string[] = [];

  for (const m of mappings) {
    const p = m.provider as any;
    if (!p?.is_active) continue;
    if (tried.includes(p.id)) continue;
    if (order.quantity < m.min_quantity || order.quantity > m.max_quantity) {
      attempts.push(`${p.name}: qty out of range`);
      tried.push(p.id);
      continue;
    }

    try {
      const providerOrderId = await callProviderAdd(p, m.provider_service_id, order.link, order.quantity);
      await supa.from('orders').update({
        status: 'processing',
        provider_order_id: providerOrderId,
        provider_used: p.id,
        tried_providers: [...tried, p.id],
        error_message: null,
        last_status_check: new Date().toISOString(),
      }).eq('id', orderId);
      return { orderId, ok: true, provider: p.name, providerOrderId };
    } catch (e: any) {
      attempts.push(`${p.name}: ${e.message}`);
      tried.push(p.id);
    }
  }

  // All providers failed → queue for retry
  const nextRetry = new Date(Date.now() + 5 * 60_000).toISOString();
  await supa.from('orders').update({
    status: 'queued',
    tried_providers: [], // reset so we retry all
    error_message: `All providers busy: ${attempts.join(' | ')}`.slice(0, 500),
    retry_count: (order.retry_count ?? 0) + 1,
    next_retry_at: nextRetry,
  }).eq('id', orderId);
  return { orderId, ok: false, error: 'all busy' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    let orderId: string | null = null;
    try {
      const body = await req.json();
      orderId = body?.order_id ?? null;
    } catch {}

    let orders: any[] = [];
    if (orderId) {
      const { data } = await supa.from('orders').select('id').eq('id', orderId).in('status', ['pending', 'queued']);
      orders = data ?? [];
    } else {
      // Batch: pick up pending + queued whose retry is due
      const now = new Date().toISOString();
      const { data } = await supa
        .from('orders')
        .select('id')
        .or(`status.eq.pending,and(status.eq.queued,next_retry_at.lte.${now})`)
        .order('created_at')
        .limit(50);
      orders = data ?? [];
    }

    const results = [];
    for (const o of orders) {
      results.push(await processOrder(o.id));
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
