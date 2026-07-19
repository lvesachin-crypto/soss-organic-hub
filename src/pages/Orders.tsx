import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Lock, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColor = (s: string) => {
  if (s === 'completed') return 'bg-green-500/15 text-green-700';
  if (s === 'processing') return 'bg-blue-500/15 text-blue-700';
  if (s === 'queued' || s === 'pending') return 'bg-amber-500/15 text-amber-700';
  if (s === 'partial') return 'bg-purple-500/15 text-purple-700';
  return 'bg-red-500/15 text-red-700';
};

export default function Orders() {
  const { user } = useAuth();
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();
  const qc = useQueryClient();

  const [serviceId, setServiceId] = useState('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');

  const { data: services } = useQuery({
    queryKey: ['services-active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, category, price, min_quantity, max_quantity')
        .eq('is_active', true)
        .order('category');
      return data ?? [];
    },
  });

  const { data: orders, refetch } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, link, quantity, price, status, start_count, remains, created_at, error_message, service:services(name, category)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const selectedService = services?.find(s => s.id === serviceId);

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!user || !selectedService) throw new Error('Select a service');
      const qty = parseInt(quantity, 10);
      if (!qty || qty < selectedService.min_quantity || qty > selectedService.max_quantity) {
        throw new Error(`Quantity must be between ${selectedService.min_quantity} and ${selectedService.max_quantity}`);
      }
      if (!/^https?:\/\//.test(link)) throw new Error('Enter a valid URL');
      const price = Number(((qty / 1000) * Number(selectedService.price)).toFixed(4));

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_id: selectedService.id,
          link,
          quantity: qty,
          price,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast.success('Order placed — dispatching to provider');
      setLink(''); setQuantity('');
      qc.invalidateQueries({ queryKey: ['orders'] });
      // Trigger dispatch
      supabase.functions.invoke('dispatch-orders', { body: {} }).catch(() => {});
      setTimeout(() => refetch(), 3000);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to place order'),
  });

  if (subLoading) {
    return <DashboardLayout><div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Place orders and track delivery.</p>
        </div>

        {!hasActiveSubscription ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-1">Subscription required</h3>
              <p className="text-sm text-muted-foreground mb-4">Activate a plan to place orders.</p>
              <Button asChild><Link to="/subscription">View plans</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> New Order</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>Service</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {services?.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.category} — {s.name} (${Number(s.price).toFixed(2)}/1k)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Link</Label>
                <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Quantity {selectedService && `(${selectedService.min_quantity}–${selectedService.max_quantity})`}</Label>
                <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div className="flex items-end">
                <div className="text-sm">
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-bold text-lg">
                    ${selectedService && quantity ? ((parseInt(quantity) / 1000) * Number(selectedService.price)).toFixed(4) : '0.00'}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                <Button onClick={() => createOrder.mutate()} disabled={createOrder.isPending || !selectedService || !link || !quantity} className="w-full sm:w-auto">
                  {createOrder.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Place order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            {!orders?.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3">#</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Link</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Delivered</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const delivered = o.start_count !== null && o.remains !== null ? Math.max(0, o.quantity - (o.remains ?? 0)) : null;
                      return (
                        <tr key={o.id} className="border-t border-border">
                          <td className="p-3 font-mono">#{o.order_number}</td>
                          <td className="p-3">{(o.service as any)?.name ?? '—'}</td>
                          <td className="p-3 max-w-[220px] truncate"><a href={o.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">{o.link}</a></td>
                          <td className="p-3">{o.quantity}</td>
                          <td className="p-3">{delivered ?? '—'}</td>
                          <td className="p-3">
                            <Badge className={statusColor(o.status)} variant="outline">
                              {o.status === 'queued' ? 'All providers busy' : o.status}
                            </Badge>
                            {o.error_message && <div className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] truncate">{o.error_message}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
