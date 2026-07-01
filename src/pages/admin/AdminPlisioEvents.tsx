import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bitcoin, Search, Loader2, ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

type PlisioEvent = {
  id: string;
  event_hash: string;
  order_id: string | null;
  invoice_id: string | null;
  status: string | null;
  signature_valid: boolean;
  processed: boolean;
  source_ip: string | null;
  payload: any;
  credit_result: any;
  notes: string | null;
  received_at: string;
};

type FilterKey = 'all' | 'invalid_sig' | 'replays' | 'credited' | 'failed';

export default function AdminPlisioEvents() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-plisio-webhook-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plisio_webhook_events' as any)
        .select('*')
        .order('received_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as PlisioEvent[];
    },
    refetchInterval: 15000,
  });

  const rows = data ?? [];

  const seen = new Set<string>();
  const withReplay = rows.map((r) => {
    const key = `${r.order_id ?? ''}|${r.event_hash}`;
    const isReplay = seen.has(key);
    seen.add(key);
    return { ...r, isReplay };
  });

  const counters = {
    total: withReplay.length,
    invalid_sig: withReplay.filter((r) => !r.signature_valid).length,
    replays: withReplay.filter((r) => r.notes?.toLowerCase().includes('replay') || r.notes?.toLowerCase().includes('duplicate')).length,
    credited: withReplay.filter((r) => r.credit_result?.credited === true).length,
    failed: withReplay.filter((r) => r.processed && r.credit_result && r.credit_result?.credited === false).length,
  };

  const filtered = withReplay.filter((r) => {
    if (filter === 'invalid_sig' && r.signature_valid) return false;
    if (filter === 'replays' && !(r.notes?.toLowerCase().includes('replay') || r.notes?.toLowerCase().includes('duplicate'))) return false;
    if (filter === 'credited' && r.credit_result?.credited !== true) return false;
    if (filter === 'failed' && !(r.processed && r.credit_result && r.credit_result?.credited === false)) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const hay = `${r.order_id ?? ''} ${r.invoice_id ?? ''} ${r.status ?? ''} ${r.source_ip ?? ''} ${r.notes ?? ''} ${r.event_hash}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const creditOutcome = (r: PlisioEvent & { isReplay?: boolean }) => {
    if (!r.processed) return { label: 'Unprocessed', tone: 'bg-slate-500/15 text-slate-500', icon: <RefreshCw className="h-3 w-3" /> };
    if (r.credit_result?.credited === true) {
      const inr = r.credit_result?.credited_inr;
      return {
        label: `Credited${inr ? ` ₹${Number(inr).toFixed(2)}` : ''}`,
        tone: 'bg-emerald-500/15 text-emerald-600',
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    }
    if (r.credit_result?.duplicate) return { label: 'Duplicate (already credited)', tone: 'bg-amber-500/15 text-amber-600', icon: <RefreshCw className="h-3 w-3" /> };
    if (r.credit_result?.reason) return { label: `Skipped: ${r.credit_result.reason}`, tone: 'bg-amber-500/15 text-amber-600', icon: <XCircle className="h-3 w-3" /> };
    return { label: 'No credit', tone: 'bg-red-500/15 text-red-500', icon: <XCircle className="h-3 w-3" /> };
  };

  const filterBtn = (key: FilterKey, label: string, count: number) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        filter === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted border-border'
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Plisio Webhook Events</h1>
              <p className="text-sm text-muted-foreground">
                Signature validity, replay status aur credit outcome — sab live.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border bg-card hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterBtn('all', 'All', counters.total)}
          {filterBtn('invalid_sig', '❌ Invalid signature', counters.invalid_sig)}
          {filterBtn('replays', '🔁 Replays', counters.replays)}
          {filterBtn('credited', '✅ Credited', counters.credited)}
          {filterBtn('failed', '⚠️ Not credited', counters.failed)}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="order_id / invoice_id / IP / status / notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isLoading ? 'Loading…' : `${filtered.length} event${filtered.length === 1 ? '' : 's'}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading webhook events…
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-12">
                Koi webhook event nahi mila.
              </p>
            )}

            {filtered.map((row) => {
              const outcome = creditOutcome(row);
              const isOpen = openId === row.id;
              const isReplayNote = row.notes?.toLowerCase().includes('replay') || row.notes?.toLowerCase().includes('duplicate');
              return (
                <div key={row.id} className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.signature_valid ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Signature valid
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/20 border-red-500/30">
                        <ShieldAlert className="h-3 w-3 mr-1" /> Invalid signature
                      </Badge>
                    )}

                    {isReplayNote || row.isReplay ? (
                      <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">🔁 Replay</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Fresh</Badge>
                    )}

                    <Badge className={`${outcome.tone} border-transparent`}>
                      <span className="mr-1">{outcome.icon}</span>
                      {outcome.label}
                    </Badge>

                    {row.status && (
                      <Badge variant="secondary" className="capitalize">{row.status}</Badge>
                    )}

                    <span className="ml-auto text-xs text-muted-foreground">
                      {format(new Date(row.received_at), 'dd MMM, HH:mm:ss')}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground grid md:grid-cols-2 gap-x-6 gap-y-1">
                    <p><b className="text-foreground">Order:</b> <span className="break-all">{row.order_id ?? '—'}</span></p>
                    <p><b className="text-foreground">Invoice:</b> <span className="break-all">{row.invoice_id ?? '—'}</span></p>
                    <p><b className="text-foreground">IP:</b> {row.source_ip ?? '—'}</p>
                    <p className="truncate" title={row.event_hash}><b className="text-foreground">Hash:</b> {row.event_hash.slice(0, 24)}…</p>
                  </div>

                  {row.notes && (
                    <p className="text-xs text-muted-foreground">
                      <b className="text-foreground">Notes:</b> {row.notes}
                    </p>
                  )}

                  <button
                    onClick={() => setOpenId(isOpen ? null : row.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    {isOpen ? 'Hide' : 'Show'} raw payload & credit result
                  </button>

                  {isOpen && (
                    <div className="grid md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Payload</p>
                        <pre className="text-[10px] bg-muted rounded-lg p-2 overflow-auto max-h-64">
                          {JSON.stringify(row.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Credit result</p>
                        <pre className="text-[10px] bg-muted rounded-lg p-2 overflow-auto max-h-64">
                          {JSON.stringify(row.credit_result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}