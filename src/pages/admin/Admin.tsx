import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Package, Server, Link2, Crown, ShoppingCart } from 'lucide-react';

export default function Admin() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, providers, services, mapping, orders, subs] = await Promise.all([
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('providers').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('service_provider_mapping').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      return {
        users: users.count ?? 0,
        providers: providers.count ?? 0,
        services: services.count ?? 0,
        mapping: mapping.count ?? 0,
        orders: orders.count ?? 0,
        subs: subs.count ?? 0,
      };
    },
  });

  const cards = [
    { to: '/admin/users', label: 'Users', value: data?.users, icon: Users },
    { to: '/admin/subscriptions', label: 'Active Subs', value: data?.subs, icon: Crown },
    { to: '/admin/providers', label: 'Providers', value: data?.providers, icon: Server },
    { to: '/admin/services', label: 'Services', value: data?.services, icon: Package },
    { to: '/admin/mapping', label: 'Mappings', value: data?.mapping, icon: Link2 },
    { to: '/orders', label: 'Total Orders', value: data?.orders, icon: ShoppingCart },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">Platform overview.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cards.map(c => (
            <Link key={c.to} to={c.to}>
              <Card className="hover:border-primary transition">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{c.label}</span>
                    <c.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{c.value ?? '—'}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
