import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useGlobalMarkup() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform-settings-markup'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_markup');
      if (error) throw error;
      return { global_markup_percent: Number(data ?? 0) };
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  const markupPercent = data?.global_markup_percent ?? 0;

  // Apply markup: if markup is +30, price becomes price * 1.3
  // If markup is -10, price becomes price * 0.9
  const applyMarkup = useCallback((basePrice: number): number => {
    return basePrice * (1 + markupPercent / 100);
  }, [markupPercent]);

  return { markupPercent, applyMarkup, isLoading };
}
