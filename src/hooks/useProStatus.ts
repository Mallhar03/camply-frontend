import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface ProStatus {
  isPro: boolean;
  planType: 'MONTHLY' | 'YEARLY' | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
}

export function useProStatus() {
  const { user, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['pro-status', user?.id],
    queryFn: async () => {
      const res = await apiFetch<ProStatus>('/api/v1/payments/status');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      query.refetch();
    };
    window.addEventListener('pro-status-update', handleUpdate);
    return () => window.removeEventListener('pro-status-update', handleUpdate);
  }, [query]);

  return query;
}
