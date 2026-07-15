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
import { Package, Plus, Trash2 } from 'lucide-react';

const ENGAGEMENT_TYPES = ['views', 'likes', 'comments', 'shares', 'followers', 'saves'];

export default function MyBundles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [platform, setPlatform] = useState('instagram');
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [item, setItem] = useState({ engagement_type: 'views', quantity: 100, user_service_id: '' });

  const { data: bundles = [] } = useQuery({
    queryKey: ['user-bundles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_bundles').select('*, user_bundle_items(*, user_services(name, provider_service_id))').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['user-services-min', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('user_services').select('id, name, provider_service_id').eq('is_active', true).order('name');
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
  async function addItem() {
    if (!addItemFor || !item.user_service_id) return;
    const { error } = await supabase.from('user_bundle_items').insert({
      user_id: user!.id, user_bundle_id: addItemFor,
      engagement_type: item.engagement_type, quantity: item.quantity, user_service_id: item.user_service_id,
    });
    if (error) toast.error(error.message);
    else { toast.success('Item added'); setAddItemFor(null); setItem({ engagement_type: 'views', quantity: 100, user_service_id: '' }); refresh(); }
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

  return (
    <DashboardLayout>
      <PageMeta title="My Bundles" description="Create engagement bundles from your own services." canonicalPath="/my-bundles" noIndex />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-blue-600" /> My Bundles</h1>
            <p className="text-sm text-muted-foreground mt-1">Apne services se engagement bundles banayein. Sirf aap ko dikhenge.</p>
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
          {bundles.map((b: any) => (
            <div key={b.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.name} <span className="text-xs text-muted-foreground">· {b.platform}</span></p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddItemFor(b.id)}><Plus className="w-3.5 h-3.5 mr-1" /> Add Item</Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteBundle(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="mt-3 grid gap-1.5">
                {(b.user_bundle_items || []).map((it: any) => (
                  <div key={it.id} className="flex items-center justify-between text-sm rounded-lg bg-muted/50 px-3 py-2">
                    <div><b className="capitalize">{it.engagement_type}</b> · qty {it.quantity} · <span className="text-xs text-muted-foreground">{it.user_services?.name}</span></div>
                    <Button size="sm" variant="ghost" className="text-red-600 h-7" onClick={() => deleteItem(it.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
                {(b.user_bundle_items || []).length === 0 && <p className="text-xs text-muted-foreground italic">No items yet</p>}
              </div>
            </div>
          ))}
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
        <DialogContent>
          <DialogHeader><DialogTitle>Add Bundle Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Engagement Type</Label>
              <select className="w-full h-10 px-3 rounded-md border bg-background" value={item.engagement_type} onChange={(e) => setItem({ ...item, engagement_type: e.target.value })}>
                {ENGAGEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><Label>Service</Label>
              <select className="w-full h-10 px-3 rounded-md border bg-background" value={item.user_service_id} onChange={(e) => setItem({ ...item, user_service_id: e.target.value })}>
                <option value="">Select…</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} (#{s.provider_service_id})</option>)}
              </select>
              {services.length === 0 && <p className="text-[11px] text-amber-600 mt-1">Import services from a provider first.</p>}
            </div>
            <div><Label>Quantity</Label><Input type="number" value={item.quantity} onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemFor(null)}>Cancel</Button>
            <Button onClick={addItem}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
