import { differenceInMinutes, parseISO } from 'date-fns';
import type {
  RouteDetailWithStops,
  RouteStopWithLocation,
  StopScheduleStatus,
  RouteScheduleStatus,
  ScheduleStatusType,
} from '@/types/schedule.types';

/**
 * Calculate schedule status for a single stop
 * Compares actual_arrival vs estimated_arrival
 */
export function calculateStopStatus(stop: RouteStopWithLocation): StopScheduleStatus {
  const isCompleted = !!stop.actual_arrival;

  if (!isCompleted) {
    return {
      stopId: stop.id,
      isCompleted: false,
      minutesAheadBehind: 0,
      status: 'not_started',
    };
  }

  if (!stop.estimated_arrival || !stop.actual_arrival) {
    return {
      stopId: stop.id,
      isCompleted: true,
      minutesAheadBehind: 0,
      status: 'on_time',
    };
  }

  const estimated = parseISO(stop.estimated_arrival);
  const actual = parseISO(stop.actual_arrival);
  // Positive = arrived early (ahead), Negative = arrived late (behind)
  const minutesDiff = differenceInMinutes(estimated, actual);

  let status: ScheduleStatusType = 'on_time';
  if (minutesDiff > 5) status = 'ahead';
  else if (minutesDiff < -5) status = 'behind';

  return {
    stopId: stop.id,
    isCompleted: true,
    minutesAheadBehind: minutesDiff,
    status,
  };
}

/**
 * Calculate overall route schedule status
 * Uses elapsed time since route start vs estimated total duration
 */
export function calculateRouteStatus(route: RouteDetailWithStops): RouteScheduleStatus {
  const completedStops = route.stops.filter((s) => !!s.actual_arrival).length;
  const totalStops = route.stops.length;
  const percentComplete = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  // Not started
  if (route.status === 'draft' || route.status === 'confirmed' || !route.started_at) {
    return {
      routeId: route.id,
      completedStops,
      totalStops,
      percentComplete: 0,
      overallMinutesAheadBehind: 0,
      status: 'not_started',
    };
  }

  // Completed
  if (route.status === 'completed') {
    const actualDuration = route.actual_duration_minutes ?? 0;
    const estimatedDuration = route.estimated_duration_minutes ?? actualDuration;
    const minutesDiff = estimatedDuration - actualDuration;

    return {
      routeId: route.id,
      completedStops,
      totalStops,
      percentComplete: 100,
      overallMinutesAheadBehind: minutesDiff,
      status: minutesDiff > 5 ? 'ahead' : minutesDiff < -5 ? 'behind' : 'on_time',
    };
  }

  // In progress - calculate based on elapsed time vs expected progress
  const startedAt = parseISO(route.started_at);
  const now = new Date();
  const elapsedMinutes = differenceInMinutes(now, startedAt);
  const estimatedTotal = route.estimated_duration_minutes ?? 0;

  if (estimatedTotal === 0 || totalStops === 0) {
    return {
      routeId: route.id,
      completedStops,
      totalStops,
      percentComplete,
      overallMinutesAheadBehind: 0,
      status: 'on_time',
    };
  }

  // Expected progress based on elapsed time
  const expectedPercent = Math.min((elapsedMinutes / estimatedTotal) * 100, 100);
  // Difference between actual and expected progress
  const progressDiff = percentComplete - expectedPercent;

  // Convert progress difference to minutes
  const minutesAheadBehind = Math.round((progressDiff / 100) * estimatedTotal);

  let status: ScheduleStatusType = 'on_time';
  if (minutesAheadBehind > 5) status = 'ahead';
  else if (minutesAheadBehind < -5) status = 'behind';

  return {
    routeId: route.id,
    completedStops,
    totalStops,
    percentComplete,
    overallMinutesAheadBehind: minutesAheadBehind,
    status,
  };
}

/**
 * Get Tailwind classes for schedule status badges
 */
export function getScheduleStatusClasses(status: ScheduleStatusType): string {
  switch (status) {
    case 'ahead':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'behind':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'on_time':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
}

/**
 * Format minutes ahead/behind for display
 */
export function formatTimeDifference(minutes: number): string {
  if (minutes === 0) return 'On time';

  const absMinutes = Math.abs(minutes);
  const direction = minutes > 0 ? 'ahead' : 'behind';

  if (absMinutes < 60) {
    return `${absMinutes}m ${direction}`;
  }

  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;

  if (mins === 0) {
    return `${hours}h ${direction}`;
  }

  return `${hours}h ${mins}m ${direction}`;
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: ScheduleStatusType): string {
  switch (status) {
    case 'ahead':
      return 'Ahead';
    case 'behind':
      return 'Behind';
    case 'on_time':
      return 'On Time';
    case 'completed':
      return 'Completed';
    case 'not_started':
      return 'Not Started';
    default:
      return status;
  }
}
