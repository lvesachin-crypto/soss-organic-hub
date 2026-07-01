import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
const PLISIO_KEY = Deno.env.get('PLISIO_SECRET_KEY')!
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const target = id
    ? `https://api.plisio.net/api/v1/operations/${id}?api_key=${PLISIO_KEY}`
    : `https://api.plisio.net/api/v1/operations?api_key=${PLISIO_KEY}&limit=30`
  const r = await fetch(target)
  const t = await r.text()
  return new Response(t, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})