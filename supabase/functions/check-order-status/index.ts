import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supa = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function callProviderStatus(provider: any, providerOrderId: string) {
  const body = new URLSearchParams({
    key: provider.api_key,
    action: 'status',
    order: providerOrderId,
  });
  const res = await fetch(provider.api_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`Non-JSON: ${text.slice(0, 200)}`); }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { data: orders } = await supa
      .from('orders')
      .select('id, provider_order_id, provider_used, quantity, provider:providers!orders_provider_used_fkey(*)')
      .eq('status', 'processing')
      .not('provider_order_id', 'is', null)
      .order('last_status_check', { ascending: true, nullsFirst: true })
      .limit(100);

    const results = [];
    for (const o of orders ?? []) {
      const p = o.provider as any;
      if (!p || !o.provider_order_id) continue;
      try {
        const s = await callProviderStatus(p, o.provider_order_id);
        const remains = s.remains !== undefined ? parseInt(s.remains) : null;
        const startCount = s.start_count !== undefined ? parseInt(s.start_count) : null;
        const rawStatus = String(s.status ?? '').toLowerCase();

        let status = 'processing';
        if (rawStatus.includes('complet')) status = 'completed';
        else if (rawStatus.includes('partial')) status = 'partial';
        else if (rawStatus.includes('cancel') || rawStatus.includes('refund')) status = 'cancelled';
        else if (rawStatus.includes('fail')) status = 'failed';

        await supa.from('orders').update({
          status,
          remains,
          start_count: startCount,
          last_status_check: new Date().toISOString(),
        }).eq('id', o.id);
        results.push({ id: o.id, status, remains });
      } catch (e: any) {
        await supa.from('orders').update({
          last_status_check: new Date().toISOString(),
          error_message: e.message?.slice(0, 300),
        }).eq('id', o.id);
        results.push({ id: o.id, error: e.message });
      }
    }

    return new Response(JSON.stringify({ checked: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
