import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { useRoutesForDateRange } from '@/hooks/use-routes';
import { useJobsForDateRange } from '@/hooks/use-jobs';
import { useActiveOperators } from '@/hooks/use-operators';
import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  CalendarItem,
  useCalendarMonth,
  useCalendarYear,
  type Feature,
  type Status,
} from '@/components/kibo-ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Status configurations
const routeStatuses: Record<string, Status> = {
  draft: { id: 'draft', name: 'Draft', color: '#9ca3af' },
  confirmed: { id: 'confirmed', name: 'Confirmed', color: '#3b82f6' },
  in_progress: { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
  completed: { id: 'completed', name: 'Completed', color: '#22c55e' },
  cancelled: { id: 'cancelled', name: 'Cancelled', color: '#ef4444' },
};

const jobStatuses: Record<string, Status> = {
  scheduled: { id: 'scheduled', name: 'Scheduled', color: '#3b82f6' },
  in_progress: { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
  completed: { id: 'completed', name: 'Completed', color: '#22c55e' },
  cancelled: { id: 'cancelled', name: 'Cancelled', color: '#ef4444' },
  skipped: { id: 'skipped', name: 'Skipped', color: '#9ca3af' },
  rescheduled: { id: 'rescheduled', name: 'Rescheduled', color: '#8b5cf6' },
};

function CalendarContent() {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const [operatorFilter, setOperatorFilter] = useState<string>('all');

  // Calculate date range for current month view
  const dateRange = useMemo(() => {
    const current = new Date(year, month, 1);
    const start = startOfMonth(subMonths(current, 1)); // Include prev month for overflow
    const end = endOfMonth(addMonths(current, 1)); // Include next month for overflow
    return {
      from: format(start, 'yyyy-MM-dd'),
      to: format(end, 'yyyy-MM-dd'),
    };
  }, [month, year]);

  // Fetch routes and jobs
  const { data: routesData, isLoading: routesLoading } = useRoutesForDateRange(
    dateRange.from,
    dateRange.to
  );
  const { data: jobsData, isLoading: jobsLoading } = useJobsForDateRange(
    dateRange.from,
    dateRange.to
  );
  const { data: operatorsData } = useActiveOperators();

  const isLoading = routesLoading || jobsLoading;

  // Transform routes and jobs into calendar features
  const features: Feature[] = useMemo(() => {
    const routeFeatures: Feature[] = (routesData?.data ?? [])
      .filter((route) => operatorFilter === 'all' || route.operator_id === operatorFilter)
      .map((route) => ({
        id: `route-${route.id}`,
        name: `Route: ${route.operator.first_name} ${route.operator.last_name}`,
        startAt: new Date(route.route_date),
        endAt: new Date(route.route_date),
        status: routeStatuses[route.status] ?? routeStatuses.draft,
      }));

    const jobFeatures: Feature[] = (jobsData?.data ?? [])
      .filter((job) => operatorFilter === 'all' || job.performed_by === operatorFilter)
      .map((job) => ({
        id: `job-${job.id}`,
        name: `${job.job_number}: ${job.lawn.property.address_line1}`,
        startAt: new Date(job.scheduled_date),
        endAt: new Date(job.scheduled_date),
        status: jobStatuses[job.status] ?? jobStatuses.scheduled,
      }));

    return [...routeFeatures, ...jobFeatures];
  }, [routesData, jobsData, operatorFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Operator:</span>
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All operators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All operators</SelectItem>
              {operatorsData?.data?.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.first_name} {op.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <CalendarDate>
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker start={2024} end={2030} />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader />
              <CalendarBody features={features}>
                {({ feature }) => (
                  <CalendarItem
                    key={feature.id}
                    feature={feature}
                    className="cursor-pointer hover:opacity-80 text-xs"
                  />
                )}
              </CalendarBody>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Routes</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(routeStatuses).map(([key, status]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: status.color, color: status.color }}
                  >
                    {status.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Jobs</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(jobStatuses).map(([key, status]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: status.color, color: status.color }}
                  >
                    {status.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ScheduleCalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule Calendar</h1>

      <CalendarProvider locale="en-GB" startDay={1} className="h-full">
        <CalendarContent />
      </CalendarProvider>
    </div>
  );
}
