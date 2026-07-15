import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageMeta } from '@/components/seo/PageMeta';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package, Plus, Trash2, Globe, Eye, Heart, MessageCircle, Bookmark, Share2, Repeat, UserPlus } from 'lucide-react';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const ENGAGEMENT_TYPES = [
  { key: 'views', label: 'Views', icon: Eye },
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'comments', label: 'Comments', icon: MessageCircle },
  { key: 'saves', label: 'Saves', icon: Bookmark },
  { key: 'shares', label: 'Shares', icon: Share2 },
  { key: 'reposts', label: 'Reposts', icon: Repeat },
  { key: 'followers', label: 'Followers', icon: UserPlus },
];

export default function MyBundles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [providersFor, setProvidersFor] = useState<{ itemId: string; itemLabel: string } | null>(null);

  const { data: bundles = [] } = useQuery({
    queryKey: ['user-bundles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bundles')
        .select('*, user_bundle_items(*, user_bundle_item_providers(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['user-provider-accounts-min', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('user_provider_accounts').select('id, name').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['user-bundles'] });

  async function createBundle() {
    if (!name) return toast.error('Name required');
    const { error } = await supabase.from('user_bundles').insert({ user_id: user!.id, name, description: desc, platform });
    if (error) toast.error(error.message);
    else { toast.success('Bundle created'); setCreateOpen(false); setName(''); setDesc(''); refresh(); }
  }
  async function deleteBundle(id: string) {
    if (!confirm('Delete this bundle?')) return;
    const { error } = await supabase.from('user_bundles').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refresh(); }
  }
  async function addEngagementItem(bundleId: string, engagementType: string) {
    const exists = bundles.find((b: any) => b.id === bundleId)?.user_bundle_items?.some((i: any) => i.engagement_type === engagementType);
    if (exists) return toast.error(`${engagementType} already added`);
    const { error } = await supabase.from('user_bundle_items').insert({
      user_id: user!.id, user_bundle_id: bundleId, engagement_type: engagementType, quantity: 100,
    });
    if (error) toast.error(error.message); else refresh();
  }
  async function deleteItem(id: string) {
    const { error } = await supabase.from('user_bundle_items').delete().eq('id', id);
    if (error) toast.error(error.message); else refresh();
  }
  async function updateQuantity(id: string, quantity: number) {
    await supabase.from('user_bundle_items').update({ quantity }).eq('id', id);
    refresh();
  }

  return (
    <DashboardLayout>
      <PageMeta title="My Bundles" description="Create engagement bundles from your own services." canonicalPath="/my-bundles" noIndex />
      <SubscriptionGuard>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> My Bundles</h1>
              <p className="text-sm text-muted-foreground mt-1">Create bundles and map each engagement type to your provider accounts with priority-based rotation.</p>
            </div>
            <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Bundle</Button>
          </div>

          <div className="grid gap-4">
            {bundles.length === 0 && (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">No bundles yet</p>
              </div>
            )}
            {bundles.map((b: any) => {
              const items: any[] = b.user_bundle_items || [];
              const usedTypes = new Set(items.map((i) => i.engagement_type));
              return (
                <div key={b.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{b.name} <span className="text-xs text-muted-foreground">· {b.platform}</span></p>
                      <p className="text-xs text-muted-foreground">{b.description || 'No description'}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBundle(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>

                  {/* Engagement type chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ENGAGEMENT_TYPES.map(({ key, label, icon: Icon }) => {
                      const active = usedTypes.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => !active && addEngagementItem(b.id, key)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border transition ${
                            active ? 'bg-muted text-muted-foreground opacity-60 cursor-default' : 'bg-background hover:bg-primary/5 hover:border-primary/40'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                          {!active && <Plus className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div className="mt-4 space-y-2">
                    {items.map((it: any) => {
                      const meta = ENGAGEMENT_TYPES.find((e) => e.key === it.engagement_type);
                      const Icon = meta?.icon || Eye;
                      const mappedCount = (it.user_bundle_item_providers || []).filter((p: any) => p.enabled).length;
                      return (
                        <div key={it.id} className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium capitalize text-sm">{it.engagement_type}</div>
                                <div className="text-[11px] text-muted-foreground">{mappedCount} provider{mappedCount !== 1 ? 's' : ''} mapped</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => setProvidersFor({ itemId: it.id, itemLabel: `${b.platform} ${it.engagement_type}` })}>
                                <Globe className="w-3.5 h-3.5 mr-1" /> Providers
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => deleteItem(it.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {items.length === 0 && <p className="text-xs text-muted-foreground italic">Add engagement types above to get started.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Bundle</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
              <div><Label>Platform</Label>
                <select className="w-full h-10 px-3 rounded-md border bg-background" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {['instagram', 'youtube', 'tiktok', 'facebook', 'twitter', 'telegram', 'other'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={createBundle}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ProvidersDialog
          open={!!providersFor}
          onClose={() => { setProvidersFor(null); refresh(); }}
          itemId={providersFor?.itemId || ''}
          itemLabel={providersFor?.itemLabel || ''}
          accounts={accounts as any[]}
          userId={user?.id || ''}
        />
      </SubscriptionGuard>
    </DashboardLayout>
  );
}

function ProvidersDialog({
  open, onClose, itemId, itemLabel, accounts, userId,
}: { open: boolean; onClose: () => void; itemId: string; itemLabel: string; accounts: any[]; userId: string }) {
  const qc = useQueryClient();
  const { data: mappings = [] } = useQuery({
    queryKey: ['ubi-providers', itemId],
    enabled: !!itemId && open,
    queryFn: async () => {
      const { data } = await supabase.from('user_bundle_item_providers').select('*').eq('user_bundle_item_id', itemId);
      return data || [];
    },
  });

  const byAccount: Record<string, any> = {};
  for (const m of mappings) byAccount[m.user_provider_account_id] = m;

  async function upsertMapping(accountId: string, patch: Partial<{ enabled: boolean; provider_service_id: string | null; priority: number }>) {
    const existing = byAccount[accountId];
    let error: any = null;
    if (existing) {
      ({ error } = await supabase.from('user_bundle_item_providers').update(patch).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('user_bundle_item_providers').insert({
        user_id: userId,
        user_bundle_item_id: itemId,
        user_provider_account_id: accountId,
        enabled: patch.enabled ?? true,
        provider_service_id: patch.provider_service_id ?? null,
        priority: patch.priority ?? 1,
      }));
    }
    if (error) {
      toast.error(error.message || 'Failed to save');
      return;
    }
    toast.success('Saved');
    await qc.invalidateQueries({ queryKey: ['ubi-providers', itemId] });
  }


  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Providers</DialogTitle>
          <DialogDescription>Which provider accounts can fulfill "{itemLabel}"</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-[64px_1fr_1fr_100px] text-xs font-semibold px-4 py-2 bg-muted/50 border-b">
            <div>Use</div>
            <div>Account</div>
            <div>Service ID</div>
            <div className="text-right">Priority</div>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y">
            {accounts.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No provider accounts. Add one from My Providers first.</div>
            )}
            {accounts.map((a: any) => {
              const m = byAccount[a.id];
              const enabled = !!m?.enabled;
              return (
                <div key={a.id} className={`grid grid-cols-[64px_1fr_1fr_100px] items-center px-4 py-3 gap-2 ${enabled ? 'bg-primary/5' : ''}`}>
                  <div>
                    <button
                      onClick={() => upsertMapping(a.id, { enabled: !enabled })}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enabled ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}
                      aria-label="toggle use"
                    >
                      {enabled && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.name}</div>
                  </div>
                  <div>
                    <Input
                      placeholder="Service ID"
                      defaultValue={m?.provider_service_id || ''}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (m?.provider_service_id || '')) upsertMapping(a.id, { provider_service_id: v || null, enabled: enabled || !!v });
                      }}
                      className="h-9"
                    />

                  </div>
                  <div className="text-right">
                    <Input
                      type="number"
                      min={1}
                      defaultValue={m?.priority ?? 1}
                      onBlur={(e) => {
                        const v = Math.max(1, Number(e.target.value) || 1);
                        if (v !== (m?.priority ?? 1)) upsertMapping(a.id, { priority: v });
                      }}
                      className="h-9 w-20 ml-auto text-right"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 border border-dashed p-3 text-xs text-muted-foreground">
          <b className="text-foreground">Priority Order:</b> Lower number = tried first (1 = highest priority).<br />
          If account #1 has an active order on the same link, system tries #2, then #3, and so on.
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
