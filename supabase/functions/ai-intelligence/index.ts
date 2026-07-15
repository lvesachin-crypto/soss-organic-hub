import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { link, goal } = await req.json().catch(() => ({}));
    if (!link || typeof link !== 'string') {
      return new Response(JSON.stringify({ error: 'link required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const system = `You are an SMM (social media growth) strategist for Boostly Pro : Luxury Edition.
The user runs organic engagement campaigns (views, likes, shares, comments, saves, followers) on Instagram / YouTube / TikTok using their own provider API keys.
Given a post link and optional goal, produce a concise, actionable strategy in markdown:
- Detect platform from URL
- Recommend engagement type mix with numeric ratios (e.g. Views 10,000 · Likes 310 · Shares 130)
- Recommend delivery timeframe (hours) and pattern (Sigmoid / Bell / Wave)
- Peak-hour timing (India IST) tip
- Detection-risk note
Keep it under 250 words. Use short bullets, bold headers, and mono numbers.`;

    const userMsg = `Link: ${link}\nGoal: ${goal || '(none provided)'}`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: `AI ${r.status}: ${txt.slice(0, 200)}` }), {
        status: r.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await r.json();
    const suggestion = data?.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
