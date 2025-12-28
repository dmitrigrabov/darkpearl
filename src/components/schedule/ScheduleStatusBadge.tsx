import { cn } from '@/lib/utils';
import { getScheduleStatusClasses, formatTimeDifference, getStatusDisplayText } from '@/lib/schedule-utils';
import type { ScheduleStatusType } from '@/types/schedule.types';

type ScheduleStatusBadgeProps = {
  status: ScheduleStatusType;
  minutesAheadBehind?: number;
  showTime?: boolean;
  className?: string;
};

export function ScheduleStatusBadge({
  status,
  minutesAheadBehind = 0,
  showTime = true,
  className,
}: ScheduleStatusBadgeProps) {
  const statusClasses = getScheduleStatusClasses(status);
  const displayText = showTime && minutesAheadBehind !== 0
    ? formatTimeDifference(minutesAheadBehind)
    : getStatusDisplayText(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusClasses,
        className
      )}
    >
      {displayText}
    </span>
  );
}
