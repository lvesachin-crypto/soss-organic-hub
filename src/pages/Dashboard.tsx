import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { hasActiveSubscription, subscription } = useSubscription();

  const { data: stats } = useQuery({
    queryKey: ['dash-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', user!.id);
      const total = data?.length ?? 0;
      const completed = data?.filter(o => o.status === 'completed').length ?? 0;
      const processing = data?.filter(o => ['pending', 'queued', 'processing'].includes(o.status)).length ?? 0;
      const cancelled = data?.filter(o => ['cancelled', 'failed'].includes(o.status)).length ?? 0;
      return { total, completed, processing, cancelled };
    },
    enabled: !!user,
  });

  const cards = [
    { label: 'Total Orders', value: stats?.total ?? 0, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'In Progress', value: stats?.processing ?? 0, icon: Clock, color: 'text-amber-600' },
    { label: 'Failed', value: stats?.cancelled ?? 0, icon: XCircle, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>
        </div>

        {!hasActiveSubscription && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold">Subscription required</p>
                <p className="text-sm text-muted-foreground">
                  You need an active subscription to place orders.
                </p>
              </div>
              <Button asChild><Link to="/subscription">View plans <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map(c => (
            <Card key={c.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <c.icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold">Place a new order</h3>
              <p className="text-sm text-muted-foreground">Pick a service and drop a link — we route it to the best provider.</p>
            </div>
            <Button asChild><Link to="/orders">Go to Orders</Link></Button>
          </CardContent>
        </Card>

        {subscription && (
          <Card>
            <CardContent className="p-4 text-sm">
              <span className="text-muted-foreground">Plan: </span>
              <span className="font-semibold capitalize">{subscription.plan_type}</span>
              <span className="text-muted-foreground"> · Status: </span>
              <span className="font-semibold capitalize">{subscription.status}</span>
              {subscription.expires_at && (
                <> <span className="text-muted-foreground"> · Expires: </span>
                <span className="font-semibold">{new Date(subscription.expires_at).toLocaleDateString()}</span></>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
