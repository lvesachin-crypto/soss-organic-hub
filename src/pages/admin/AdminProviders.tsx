import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

export default function AdminProviders() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const { data: providers } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      const { data } = await supabase.from('providers').select('*').order('name');
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!name || !apiUrl || !apiKey) throw new Error('All fields required');
      const { error } = await supabase.from('providers').insert({ name, api_url: apiUrl, api_key: apiKey });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Provider added');
      setName(''); setApiUrl(''); setApiKey('');
      qc.invalidateQueries({ queryKey: ['admin-providers'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('providers').update({ is_active: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-providers'] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('providers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-providers'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Providers</h1>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Add Provider</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Provider A" /></div>
            <div className="sm:col-span-2"><Label>API URL</Label><Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://provider.com/api/v2" /></div>
            <div><Label>API Key</Label><Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} /></div>
            <div className="lg:col-span-4"><Button onClick={() => add.mutate()} disabled={add.isPending}>Add provider</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left"><th className="p-3">Name</th><th className="p-3">API URL</th><th className="p-3">Balance</th><th className="p-3">Active</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {providers?.map(p => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[280px] truncate">{p.api_url}</td>
                      <td className="p-3">{p.balance !== null ? `${Number(p.balance).toFixed(2)} ${p.currency ?? ''}` : '—'}</td>
                      <td className="p-3"><Switch checked={!!p.is_active} onCheckedChange={v => toggle.mutate({ id: p.id, val: v })} /></td>
                      <td className="p-3"><Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                  {!providers?.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">No providers yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
