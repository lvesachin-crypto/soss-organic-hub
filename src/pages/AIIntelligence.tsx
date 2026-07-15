import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageMeta } from '@/components/seo/PageMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { NoBundleBanner } from '@/components/NoBundleBanner';

export default function AIIntelligence() {
  const { user } = useAuth();
  const [link, setLink] = useState('');
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  const { data: bundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ['ai-intel-bundles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_bundles')
        .select('id, user_bundle_items(id)')
        .eq('is_active', true);
      return (data || []).filter((b: any) => (b.user_bundle_items?.length || 0) > 0);
    },
  });

  async function analyze() {
    if (!link) return toast.error('Post/Video link daalo');
    setBusy(true); setResult('');
    try {
      const { data, error } = await supabase.functions.invoke('ai-intelligence', {
        body: { link, goal },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any)?.suggestion || 'No response');
    } catch (e: any) {
      if (e.message?.includes('429')) toast.error('Rate limit — thodi der baad try karo');
      else if (e.message?.includes('402')) toast.error('AI credits khatam — admin ko batayein');
      else toast.error(e.message || 'Failed');
    } finally { setBusy(false); }
  }

  const showBundleBanner = !bundlesLoading && bundles.length === 0;

  return (
    <DashboardLayout>
      <PageMeta title="AI Intelligence" description="AI-powered engagement strategy" canonicalPath="/ai-intelligence" noIndex />

      <div className="max-w-4xl mx-auto space-y-6">
        {showBundleBanner && <NoBundleBanner message="AI strategy aap ke bundle ki services aur pricing use karta hai. Bundle ke bina suggestions accurate nahi honge." />}
        <div className="glass-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-luxury)' }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Intelligence</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Apna post/video link daalo — AI aapko organic engagement strategy, ideal quantities, timing aur best-fit bundle suggest karega.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <Label>Post / Video Link</Label>
            <Input className="input-3d mt-2 h-12" placeholder="https://instagram.com/p/…" value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div>
            <Label>Goal (optional)</Label>
            <Textarea className="input-3d mt-2" rows={3} placeholder="Jaise: 24 hours me viral dikhana hai, 10k reach chahiye…" value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
          <Button className="btn-3d h-11 w-full" disabled={busy} onClick={analyze}>
            {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4 mr-2" /> Get AI Strategy</>}
          </Button>
        </div>

        {result && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Strategy</h2>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
