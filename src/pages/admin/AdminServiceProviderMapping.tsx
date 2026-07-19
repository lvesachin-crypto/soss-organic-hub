import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

export default function AdminServiceProviderMapping() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ service_id: '', provider_id: '', provider_service_id: '', priority: '1' });

  const { data: services } = useQuery({ queryKey: ['services-min'], queryFn: async () => (await supabase.from('services').select('id, name, category').order('category')).data ?? [] });
  const { data: providers } = useQuery({ queryKey: ['providers-min'], queryFn: async () => (await supabase.from('providers').select('id, name').order('name')).data ?? [] });
  const { data: mappings } = useQuery({
    queryKey: ['mappings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('service_provider_mapping')
        .select('*, service:services(name, category), provider:providers(name)')
        .order('priority');
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.service_id || !form.provider_id || !form.provider_service_id) throw new Error('All fields required');
      const { error } = await supabase.from('service_provider_mapping').insert({
        service_id: form.service_id,
        provider_id: form.provider_id,
        provider_service_id: form.provider_service_id,
        priority: parseInt(form.priority) || 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mapping added');
      setForm({ service_id: '', provider_id: '', provider_service_id: '', priority: '1' });
      qc.invalidateQueries({ queryKey: ['mappings'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updatePriority = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: number }) => {
      const { error } = await supabase.from('service_provider_mapping').update({ priority }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mappings'] }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('service_provider_mapping').update({ is_active: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mappings'] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_provider_mapping').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['mappings'] }); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Service ↔ Provider Mapping</h1>
          <p className="text-muted-foreground text-sm">Map each service to one or more providers. Lower priority = tried first.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Add Mapping</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Service</Label>
              <Select value={form.service_id} onValueChange={v => setForm({ ...form, service_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>{services?.map(s => <SelectItem key={s.id} value={s.id}>{s.category} — {s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provider</Label>
              <Select value={form.provider_id} onValueChange={v => setForm({ ...form, provider_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>{providers?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Provider Service ID</Label><Input value={form.provider_service_id} onChange={e => setForm({ ...form, provider_service_id: e.target.value })} placeholder="e.g. 1234" /></div>
            <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} /></div>
            <div className="flex items-end"><Button onClick={() => add.mutate()} disabled={add.isPending} className="w-full">Add</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Service</th><th className="p-3">Provider</th><th className="p-3">Provider Service ID</th><th className="p-3">Priority</th><th className="p-3">Active</th><th></th></tr></thead>
                <tbody>
                  {mappings?.map(m => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="p-3">{(m.service as any)?.category} — {(m.service as any)?.name}</td>
                      <td className="p-3 font-medium">{(m.provider as any)?.name}</td>
                      <td className="p-3 font-mono text-xs">{m.provider_service_id}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          defaultValue={m.priority}
                          className="w-20 h-8"
                          onBlur={e => {
                            const v = parseInt(e.target.value);
                            if (v && v !== m.priority) updatePriority.mutate({ id: m.id, priority: v });
                          }}
                        />
                      </td>
                      <td className="p-3"><Switch checked={m.is_active} onCheckedChange={v => toggle.mutate({ id: m.id, val: v })} /></td>
                      <td className="p-3"><Button size="sm" variant="ghost" onClick={() => del.mutate(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                  {!mappings?.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">No mappings yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
