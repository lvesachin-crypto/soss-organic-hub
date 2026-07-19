import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Plan = 'monthly' | 'yearly' | 'lifetime';

export default function AdminSubscriptions() {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<Plan>('monthly');

  const { data: subs } = useQuery({
    queryKey: ['admin-subs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*, profile:profiles!subscriptions_user_id_fkey(email, full_name)')
        .order('updated_at', { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const activate = useMutation({
    mutationFn: async () => {
      if (!email) throw new Error('Enter user email');
      const { data: prof } = await supabase.from('profiles').select('user_id').eq('email', email.trim()).maybeSingle();
      if (!prof) throw new Error('User not found');

      const days = plan === 'monthly' ? 30 : plan === 'yearly' ? 365 : null;
      const expiresAt = days ? new Date(Date.now() + days * 86400_000).toISOString() : null;

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: prof.user_id,
        plan_type: plan,
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: expiresAt,
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Subscription activated'); setEmail(''); qc.invalidateQueries({ queryKey: ['admin-subs'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const deactivate = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('subscriptions').update({ status: 'inactive', plan_type: 'none' }).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Deactivated'); qc.invalidateQueries({ queryKey: ['admin-subs'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Subscriptions</h1>

        <Card>
          <CardHeader><CardTitle className="text-base">Manually activate</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1"><Label>User email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Plan</Label>
              <Select value={plan} onValueChange={v => setPlan(v as Plan)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly ($39 / 30d)</SelectItem>
                  <SelectItem value="yearly">Yearly ($99 / 365d)</SelectItem>
                  <SelectItem value="lifetime">Lifetime ($199)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"><Button onClick={() => activate.mutate()} disabled={activate.isPending} className="w-full">Activate</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Expires</th><th></th></tr></thead>
                <tbody>
                  {subs?.map(s => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="p-3">{(s.profile as any)?.email ?? s.user_id.slice(0, 8)}</td>
                      <td className="p-3 capitalize">{s.plan_type}</td>
                      <td className="p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                      <td className="p-3">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="p-3">{s.status === 'active' && <Button size="sm" variant="outline" onClick={() => deactivate.mutate(s.user_id)}>Deactivate</Button>}</td>
                    </tr>
                  ))}
                  {!subs?.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">No subscriptions.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
