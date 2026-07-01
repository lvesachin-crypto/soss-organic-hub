import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
const PLISIO_KEY = Deno.env.get('PLISIO_SECRET_KEY')!
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const r = await fetch(`https://api.plisio.net/api/v1/operations?api_key=${PLISIO_KEY}&limit=30`)
  const t = await r.text()
  return new Response(t, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})