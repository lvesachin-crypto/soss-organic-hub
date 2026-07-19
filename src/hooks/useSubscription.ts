import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const hasActive =
    data?.status === 'active' &&
    ['monthly', 'yearly', 'lifetime'].includes(data?.plan_type ?? '') &&
    (!data?.expires_at || new Date(data.expires_at) > new Date());

  return { subscription: data, hasActiveSubscription: !!hasActive, isLoading };
}
