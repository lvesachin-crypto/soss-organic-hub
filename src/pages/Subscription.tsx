import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircle, Crown } from 'lucide-react';

const TELEGRAM_URL = 'https://t.me/Organicsmmcashier';

export default function Subscription() {
  const { user } = useAuth();
  const { subscription, hasActiveSubscription } = useSubscription();

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');
      return data ?? [];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-primary" /> Subscription</h1>
          <p className="text-muted-foreground">Activate a plan to place orders and use the platform.</p>
        </div>

        {subscription && (
          <Card>
            <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current plan</div>
                <div className="font-semibold capitalize text-lg">
                  {subscription.plan_type}
                  <Badge className="ml-2" variant={hasActiveSubscription ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              {subscription.expires_at && (
                <div className="text-sm">
                  <div className="text-muted-foreground">Expires</div>
                  <div className="font-semibold">{new Date(subscription.expires_at).toLocaleDateString()}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {plans?.map(p => {
            const isCurrent = subscription?.plan_type === p.plan_type && hasActiveSubscription;
            const features = [
              'Unlimited orders',
              'Multi-provider rotation',
              'Priority queue',
              p.plan_type === 'lifetime' ? 'Lifetime access' : `${p.duration_days} days`,
            ];
            return (
              <Card key={p.id} className={isCurrent ? 'border-primary ring-2 ring-primary/30' : ''}>
                <CardContent className="p-6 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-xl capitalize">{p.name}</h3>
                    <div className="text-3xl font-extrabold mt-2">${Number(p.price).toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.plan_type === 'lifetime' ? 'one-time' : `for ${p.duration_days} days`}
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-sm mb-5 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {f}</li>
                    ))}
                  </ul>
                  <Button asChild disabled={isCurrent} className="w-full">
                    <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
                      {isCurrent ? 'Active' : (
                        <><MessageCircle className="w-4 h-4 mr-2" /> Contact to activate</>
                      )}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            To activate a plan, message our team on Telegram at <a href={TELEGRAM_URL} className="text-primary underline" target="_blank" rel="noreferrer">@Organicsmmcashier</a>. Admin will confirm your payment and enable your plan.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
