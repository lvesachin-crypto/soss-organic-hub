// User Provider Account manager: save/update key (encrypted), test connection, cache balance.
// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
const KEY_SECRET = Deno.env.get('PROVIDER_KEY_SECRET')!;

// ---- AES-GCM helpers ----
async function getKey() {
  const raw = new TextEncoder().encode(KEY_SECRET);
  const hash = await crypto.subtle.digest('SHA-256', raw);
  return await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function encrypt(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0); out.set(ct, iv.length);
  return btoa(String.fromCharCode(...out));
}
async function decrypt(payload: string): Promise<string> {
  const key = await getKey();
  const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plain);
}

// JAP-style balance call
async function callPanel(api_url: string, api_key: string, action: string, extra: Record<string, any> = {}) {
  const body = new URLSearchParams({ key: api_key, action, ...Object.fromEntries(Object.entries(extra).map(([k,v]) => [k, String(v)])) });
  const r = await fetch(api_url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const text = await r.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { throw new Error(`Panel returned non-JSON: ${text.slice(0,200)}`); }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) return json({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json().catch(() => ({}));
    const op = String(body?.op || '');

    // ---- CREATE ----
    if (op === 'create') {
      const name = String(body.name || '').trim();
      const api_url = String(body.api_url || '').trim();
      const api_key = String(body.api_key || '').trim();
      if (!name || !api_url || !api_key) return json({ error: 'name, api_url, api_key required' }, 400);
      if (!/^https?:\/\//i.test(api_url)) return json({ error: 'api_url must be http(s)://' }, 400);

      // test first
      const test = await callPanel(api_url, api_key, 'balance').catch((e) => ({ error: String(e.message || e) }));
      const ok = !test?.error && (test?.balance !== undefined);
      const ciphertext = await encrypt(api_key);
      const hint = api_key.slice(-4);

      const { data, error } = await admin.from('user_provider_accounts').insert({
        user_id: user.id, name, api_url,
        api_key_ciphertext: ciphertext, api_key_hint: hint,
        is_active: ok,
        balance_cached: ok ? Number(test.balance) : null,
        balance_currency: ok ? (test.currency || null) : null,
        last_tested_at: new Date().toISOString(),
        last_test_ok: ok,
        last_test_error: ok ? null : String(test?.error || 'Unknown'),
      }).select('id').single();
      if (error) return json({ error: error.message }, 400);
      return json({ id: data.id, ok, test });
    }

    // ---- UPDATE key ----
    if (op === 'rotate_key') {
      const id = String(body.id || '');
      const api_key = String(body.api_key || '').trim();
      if (!id || !api_key) return json({ error: 'id and api_key required' }, 400);
      const { data: row, error: rErr } = await admin.from('user_provider_accounts').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();
      if (rErr || !row) return json({ error: 'not found' }, 404);
      const test = await callPanel(row.api_url, api_key, 'balance').catch((e) => ({ error: String(e.message || e) }));
      const ok = !test?.error && (test?.balance !== undefined);
      const ciphertext = await encrypt(api_key);
      await admin.from('user_provider_accounts').update({
        api_key_ciphertext: ciphertext, api_key_hint: api_key.slice(-4),
        last_tested_at: new Date().toISOString(), last_test_ok: ok,
        last_test_error: ok ? null : String(test?.error || 'Unknown'),
        balance_cached: ok ? Number(test.balance) : row.balance_cached,
        balance_currency: ok ? (test.currency || row.balance_currency) : row.balance_currency,
      }).eq('id', id).eq('user_id', user.id);
      return json({ ok, test });
    }

    // ---- TEST existing ----
    if (op === 'test') {
      const id = String(body.id || '');
      const { data: row } = await admin.from('user_provider_accounts').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();
      if (!row) return json({ error: 'not found' }, 404);
      const key = await decrypt(row.api_key_ciphertext);
      const test = await callPanel(row.api_url, key, 'balance').catch((e) => ({ error: String(e.message || e) }));
      const ok = !test?.error && (test?.balance !== undefined);
      await admin.from('user_provider_accounts').update({
        last_tested_at: new Date().toISOString(), last_test_ok: ok,
        last_test_error: ok ? null : String(test?.error || 'Unknown'),
        balance_cached: ok ? Number(test.balance) : row.balance_cached,
        balance_currency: ok ? (test.currency || row.balance_currency) : row.balance_currency,
      }).eq('id', id);
      return json({ ok, test });
    }

    // ---- IMPORT services ----
    if (op === 'import_services') {
      const id = String(body.id || '');
      const { data: row } = await admin.from('user_provider_accounts').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();
      if (!row) return json({ error: 'not found' }, 404);
      const key = await decrypt(row.api_key_ciphertext);
      const list = await callPanel(row.api_url, key, 'services').catch((e) => ({ error: String(e.message || e) }));
      if (!Array.isArray(list)) return json({ error: list?.error || 'panel did not return services array' }, 400);

      const rows = list.map((s: any) => ({
        user_id: user.id,
        user_provider_account_id: id,
        provider_service_id: String(s.service ?? s.id ?? ''),
        name: String(s.name ?? 'Unnamed'),
        category: s.category ? String(s.category) : null,
        type: s.type ? String(s.type) : null,
        rate: Number(s.rate ?? 0) || 0,
        min_quantity: Number(s.min ?? 1) || 1,
        max_quantity: Number(s.max ?? 1000000) || 1000000,
        refill: Boolean(s.refill) || false,
        cancel_allowed: Boolean(s.cancel) || false,
        is_active: true,
        raw: s,
      })).filter((r) => r.provider_service_id);

      // upsert
      const { error: upErr } = await admin.from('user_services').upsert(rows, { onConflict: 'user_provider_account_id,provider_service_id' });
      if (upErr) return json({ error: upErr.message }, 400);
      return json({ imported: rows.length });
    }

    // ---- PLACE ORDER using user's provider ----
    if (op === 'place_order') {
      const service_id = String(body.user_service_id || '');
      const link = String(body.link || '').trim();
      const quantity = Number(body.quantity || 0);
      if (!service_id || !link || !quantity) return json({ error: 'user_service_id, link, quantity required' }, 400);

      const { data: svc } = await admin.from('user_services').select('*').eq('id', service_id).eq('user_id', user.id).maybeSingle();
      if (!svc) return json({ error: 'service not found' }, 404);
      const { data: prov } = await admin.from('user_provider_accounts').select('*').eq('id', svc.user_provider_account_id).eq('user_id', user.id).maybeSingle();
      if (!prov) return json({ error: 'provider not found' }, 404);

      const key = await decrypt(prov.api_key_ciphertext);
      const resp = await callPanel(prov.api_url, key, 'add', { service: svc.provider_service_id, link, quantity });
      if (resp?.error) return json({ error: resp.error }, 400);
      return json({ ok: true, provider_response: resp });
    }

    return json({ error: 'unknown op' }, 400);
  } catch (e: any) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
