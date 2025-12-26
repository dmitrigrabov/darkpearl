import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementsApi } from '@/lib/api';
import type { CreateStockMovementRequest } from '@/types/api.types';

export function useStockMovements(params?: Parameters<typeof stockMovementsApi.list>[0]) {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockMovementsApi.list(params),
  });
}

export function useStockMovement(id: string) {
  return useQuery({
    queryKey: ['stock-movements', id],
    queryFn: () => stockMovementsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockMovementRequest) => stockMovementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
