import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

export default function AdminServices() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', category: '', price: '', min: '100', max: '100000' });

  const { data: services } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').order('category').order('name');
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.name || !form.category || !form.price) throw new Error('Name, category, price required');
      const { error } = await supabase.from('services').insert({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        min_quantity: parseInt(form.min) || 1,
        max_quantity: parseInt(form.max) || 100000,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Service added');
      setForm({ name: '', category: '', price: '', min: '100', max: '100000' });
      qc.invalidateQueries({ queryKey: ['admin-services'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('services').update({ is_active: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Services</h1>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Add Service</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Instagram" /></div>
            <div className="lg:col-span-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Reels Views" /></div>
            <div><Label>Price / 1k ($)</Label><Input type="number" step="0.0001" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div className="flex gap-2">
              <div className="flex-1"><Label>Min</Label><Input type="number" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} /></div>
              <div className="flex-1"><Label>Max</Label><Input type="number" value={form.max} onChange={e => setForm({ ...form, max: e.target.value })} /></div>
            </div>
            <div className="lg:col-span-5"><Button onClick={() => add.mutate()} disabled={add.isPending}>Add service</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Category</th><th className="p-3">Name</th><th className="p-3">Price/1k</th><th className="p-3">Min–Max</th><th className="p-3">Active</th><th></th></tr></thead>
                <tbody>
                  {services?.map(s => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="p-3">{s.category}</td>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">${Number(s.price).toFixed(4)}</td>
                      <td className="p-3">{s.min_quantity} – {s.max_quantity}</td>
                      <td className="p-3"><Switch checked={!!s.is_active} onCheckedChange={v => toggle.mutate({ id: s.id, val: v })} /></td>
                      <td className="p-3"><Button size="sm" variant="ghost" onClick={() => del.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                  {!services?.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">No services yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
