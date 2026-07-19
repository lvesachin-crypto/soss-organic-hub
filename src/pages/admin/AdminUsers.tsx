import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, ShieldOff } from 'lucide-react';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at, is_banned, subscription:subscriptions(plan_type, status, expires_at)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!data) return [];
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const roleMap = new Map<string, string[]>();
      (roles ?? []).forEach(r => {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      return data.map(u => ({ ...u, _roles: roleMap.get(u.user_id) ?? [] }));
    },
  });

  const grantAdmin = useMutation({
    mutationFn: async ({ userId, on }: { userId: string; on: boolean }) => {
      if (on) {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error && !error.message.includes('duplicate')) throw error;
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = users?.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
        <Input placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Role</th><th className="p-3">Joined</th><th></th></tr></thead>
                <tbody>
                  {filtered?.map(u => {
                    const isAdmin = (u.roles as any[])?.some(r => r.role === 'admin');
                    const sub = Array.isArray(u.subscription) ? u.subscription[0] : (u.subscription as any);
                    return (
                      <tr key={u.user_id} className="border-t border-border">
                        <td className="p-3">
                          <div className="font-medium">{u.full_name || u.email}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="p-3">
                          {sub?.status === 'active' ? (
                            <Badge>{sub.plan_type}</Badge>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3">{isAdmin ? <Badge>admin</Badge> : <span className="text-muted-foreground">user</span>}</td>
                        <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => grantAdmin.mutate({ userId: u.user_id, on: !isAdmin })}>
                            {isAdmin ? <><ShieldOff className="w-3 h-3 mr-1" /> Revoke admin</> : <><Shield className="w-3 h-3 mr-1" /> Grant admin</>}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered?.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">No users.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
