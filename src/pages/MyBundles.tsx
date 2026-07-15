import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageMeta } from '@/components/seo/PageMeta';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Package, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const ENGAGEMENT_TYPES = ['views', 'likes', 'comments', 'shares', 'followers', 'saves'];

export default function MyBundles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [platform, setPlatform] = useState('instagram');
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [addEngagement, setAddEngagement] = useState('views');
  const [addQuantity, setAddQuantity] = useState(100);
  const [addSelections, setAddSelections] = useState<Record<string, number>>({}); // user_service_id -> priority

  const { data: bundles = [] } = useQuery({
    queryKey: ['user-bundles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bundles')
        .select('*, user_bundle_items(*, user_services(id, name, provider_service_id, user_provider_account_id, user_provider_accounts(name)))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['user-services-min', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_services')
        .select('id, name, provider_service_id, user_provider_account_id, user_provider_accounts(name)')
        .eq('is_active', true)
        .order('name');
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

  function openAddItem(bundleId: string) {
    setAddItemFor(bundleId);
    setAddEngagement('views');
    setAddQuantity(100);
    setAddSelections({});
  }

  function toggleService(id: string) {
    setAddSelections((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = Object.keys(next).length + 1;
      // renumber
      const keys = Object.keys(next).sort((a, b) => next[a] - next[b]);
      const renum: Record<string, number> = {};
      keys.forEach((k, i) => (renum[k] = i + 1));
      return renum;
    });
  }
  function movePriority(id: string, dir: -1 | 1) {
    setAddSelections((prev) => {
      const entries = Object.entries(prev).sort((a, b) => a[1] - b[1]);
      const idx = entries.findIndex(([k]) => k === id);
      if (idx < 0) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= entries.length) return prev;
      [entries[idx], entries[swap]] = [entries[swap], entries[idx]];
      const out: Record<string, number> = {};
      entries.forEach(([k], i) => (out[k] = i + 1));
      return out;
    });
  }

  async function saveAddItems() {
    if (!addItemFor) return;
    const rows = Object.entries(addSelections).map(([user_service_id, priority]) => ({
      user_id: user!.id,
      user_bundle_id: addItemFor,
      engagement_type: addEngagement,
      quantity: addQuantity,
      user_service_id,
      priority,
    }));
    if (rows.length === 0) return toast.error('Select at least one provider service');
    const { error } = await supabase.from('user_bundle_items').insert(rows);
    if (error) toast.error(error.message);
    else { toast.success(`${rows.length} provider${rows.length > 1 ? 's' : ''} added`); setAddItemFor(null); refresh(); }
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from('user_bundle_items').delete().eq('id', id);
    if (error) toast.error(error.message); else refresh();
  }
  async function deleteBundle(id: string) {
    if (!confirm('Delete this bundle?')) return;
    const { error } = await supabase.from('user_bundles').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refresh(); }
  }
  async function shiftPriority(item: any, dir: -1 | 1) {
    const { error } = await supabase.from('user_bundle_items').update({ priority: Math.max(1, (item.priority || 1) + dir) }).eq('id', item.id);
    if (error) toast.error(error.message); else refresh();
  }

  // group items by engagement_type per bundle
  function groupItems(items: any[]) {
    const map: Record<string, any[]> = {};
    for (const it of items || []) {
      (map[it.engagement_type] ||= []).push(it);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.priority || 1) - (b.priority || 1));
    }
    return map;
  }

  return (
    <DashboardLayout>
      <PageMeta title="My Bundles" description="Create engagement bundles from your own services." canonicalPath="/my-bundles" noIndex />
      <SubscriptionGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> My Bundles</h1>
            <p className="text-sm text-muted-foreground mt-1">Add multiple provider services per engagement type. Priority = rotation order.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Bundle</Button>
        </div>

        <div className="grid gap-3">
          {bundles.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No bundles yet</p>
            </div>
          )}
          {bundles.map((b: any) => {
            const grouped = groupItems(b.user_bundle_items);
            return (
              <div key={b.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{b.name} <span className="text-xs text-muted-foreground">· {b.platform}</span></p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAddItem(b.id)}><Plus className="w-3.5 h-3.5 mr-1" /> Add Item</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBundle(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {Object.keys(grouped).length === 0 && <p className="text-xs text-muted-foreground italic">No items yet</p>}
                  {Object.entries(grouped).map(([etype, items]) => (
                    <div key={etype} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold capitalize">{etype} <span className="text-xs text-muted-foreground font-normal">· qty {items[0]?.quantity}</span></div>
                        <div className="text-[11px] text-muted-foreground">{items.length} provider{items.length > 1 ? 's' : ''} · rotation by priority</div>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((it: any, idx: number) => (
                          <div key={it.id} className="flex items-center gap-2 text-sm rounded-md bg-background px-3 py-2 border">
                            <div className="w-7 h-7 shrink-0 rounded-md bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">#{it.priority || idx + 1}</div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{it.user_services?.name || '—'}</div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {it.user_services?.user_provider_accounts?.name || 'Provider'} · Service #{it.user_services?.provider_service_id}
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => shiftPriority(it, -1)} disabled={idx === 0}><ArrowUp className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => shiftPriority(it, 1)} disabled={idx === items.length - 1}><ArrowDown className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteItem(it.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
                {['instagram','youtube','tiktok','facebook','twitter','telegram','other'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createBundle}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addItemFor} onOpenChange={(o) => !o && setAddItemFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Provider Rotation</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Pick multiple provider services for this engagement type. Priority = rotation order (lowest first).</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Engagement Type</Label>
                <select className="w-full h-10 px-3 rounded-md border bg-background" value={addEngagement} onChange={(e) => setAddEngagement(e.target.value)}>
                  {ENGAGEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Default Quantity</Label>
                <Input type="number" value={addQuantity} onChange={(e) => setAddQuantity(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Provider Services</Label>
              {services.length === 0 && <p className="text-[11px] text-amber-600 mt-1">Import services from a provider first.</p>}
              <div className="mt-2 max-h-80 overflow-y-auto rounded-md border divide-y">
                {services.map((s: any) => {
                  const selected = !!addSelections[s.id];
                  const prio = addSelections[s.id];
                  return (
                    <div key={s.id} className={`flex items-center gap-2 px-3 py-2 text-sm ${selected ? 'bg-primary/5' : ''}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleService(s.id)} className="w-4 h-4" />
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleService(s.id)}>
                        <div className="truncate font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {s.user_provider_accounts?.name || 'Provider'} · Service #{s.provider_service_id}
                        </div>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-1">
                          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">#{prio}</div>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => movePriority(s.id, -1)}><ArrowUp className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => movePriority(s.id, 1)}><ArrowDown className="w-3.5 h-3.5" /></Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemFor(null)}>Cancel</Button>
            <Button onClick={saveAddItems}>Save ({Object.keys(addSelections).length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </SubscriptionGuard>
    </DashboardLayout>
  );
}
