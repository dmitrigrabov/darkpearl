import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { RouteDetailWithStops, RouteScheduleStatus } from '@/types/schedule.types';
import { calculateStopStatus } from '@/lib/schedule-utils';

type RouteProgressCardProps = {
  route: RouteDetailWithStops;
  routeStatus: RouteScheduleStatus;
};

export function RouteProgressCard({ route, routeStatus }: RouteProgressCardProps) {
  const stopsWithStatus = route.stops.map((stop) => ({
    stop,
    status: calculateStopStatus(stop),
  }));

  // Find current stop (first non-completed stop)
  const currentStopIndex = stopsWithStatus.findIndex((s) => !s.status.isCompleted);

  return (
    <Card className="w-80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Route Progress</CardTitle>
          <ScheduleStatusBadge
            status={routeStatus.status}
            minutesAheadBehind={routeStatus.overallMinutesAheadBehind}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {routeStatus.completedStops} of {routeStatus.totalStops} stops
            </span>
            <span>{routeStatus.percentComplete}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${routeStatus.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Route Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Operator:</span>
            <span className="font-medium text-foreground">
              {route.operator.first_name} {route.operator.last_name}
            </span>
          </div>
          {route.vehicle && (
            <div className="flex justify-between">
              <span>Vehicle:</span>
              <span className="font-medium text-foreground">{route.vehicle.registration}</span>
            </div>
          )}
          {route.estimated_duration_minutes && (
            <div className="flex justify-between">
              <span>Est. Duration:</span>
              <span className="font-medium text-foreground">
                {Math.floor(route.estimated_duration_minutes / 60)}h{' '}
                {route.estimated_duration_minutes % 60}m
              </span>
            </div>
          )}
        </div>

        {/* Stop List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground">Stops:</div>
          {stopsWithStatus.map(({ stop, status }, index) => {
            const isCurrent = index === currentStopIndex;
            const isCompleted = status.isCompleted;

            return (
              <div
                key={stop.id}
                className={`flex items-start gap-2 p-2 rounded text-xs ${
                  isCurrent ? 'bg-primary/10 border border-primary/30' : ''
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{stop.lawn.name}</div>
                  <div className="text-muted-foreground truncate">
                    {stop.lawn.property.address_line1}
                  </div>
                  {isCompleted && status.minutesAheadBehind !== 0 && (
                    <ScheduleStatusBadge
                      status={status.status}
                      minutesAheadBehind={status.minutesAheadBehind}
                      className="mt-1"
                    />
                  )}
                </div>
                <div className="text-muted-foreground">#{stop.stop_order}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
