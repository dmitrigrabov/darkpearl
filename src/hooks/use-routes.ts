import { useQuery } from '@tanstack/react-query';
import { routesApi } from '@/lib/api';

export function useRoutes(params?: Parameters<typeof routesApi.list>[0]) {
  return useQuery({
    queryKey: ['routes', params],
    queryFn: () => routesApi.list(params),
  });
}

export function useRoute(id: string | undefined) {
  return useQuery({
    queryKey: ['routes', id],
    queryFn: () => routesApi.get(id!),
    enabled: !!id,
  });
}

export function useRoutesForDate(date: string | undefined) {
  return useQuery({
    queryKey: ['routes', 'date', date],
    queryFn: () => routesApi.list({ route_date: date, limit: 100 }),
    enabled: !!date,
  });
}

export function useRoutesForDateRange(dateFrom: string | undefined, dateTo: string | undefined) {
  return useQuery({
    queryKey: ['routes', 'range', dateFrom, dateTo],
    queryFn: () => routesApi.list({ date_from: dateFrom, date_to: dateTo, limit: 500 }),
    enabled: !!dateFrom && !!dateTo,
  });
}
