import { useQuery } from '@tanstack/react-query';
import { operatorsApi } from '@/lib/api';

export function useOperators(params?: Parameters<typeof operatorsApi.list>[0]) {
  return useQuery({
    queryKey: ['operators', params],
    queryFn: () => operatorsApi.list(params),
  });
}

export function useActiveOperators() {
  return useQuery({
    queryKey: ['operators', 'active'],
    queryFn: () => operatorsApi.list({ is_active: true, limit: 100 }),
  });
}
