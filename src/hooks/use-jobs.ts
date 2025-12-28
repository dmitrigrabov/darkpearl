import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';

export function useJobs(params?: Parameters<typeof jobsApi.list>[0]) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.list(params),
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.get(id!),
    enabled: !!id,
  });
}

export function useJobsForDate(date: string | undefined) {
  return useQuery({
    queryKey: ['jobs', 'date', date],
    queryFn: () => jobsApi.list({ scheduled_date: date, limit: 100 }),
    enabled: !!date,
  });
}

export function useJobsForDateRange(dateFrom: string | undefined, dateTo: string | undefined) {
  return useQuery({
    queryKey: ['jobs', 'range', dateFrom, dateTo],
    queryFn: () => jobsApi.list({ date_from: dateFrom, date_to: dateTo, limit: 500 }),
    enabled: !!dateFrom && !!dateTo,
  });
}
