import { cn } from '@/lib/utils';
import { Check, X, Loader2, Circle } from 'lucide-react';
import { format } from 'date-fns';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
  timestamp?: string;
  error?: string;
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-4 w-4" />
        </div>
      );
    case 'in_progress':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    case 'failed':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Circle className="h-4 w-4" />
        </div>
      );
  }
}

function StepConnector({ isLast, isCompleted }: { isLast: boolean; isCompleted: boolean }) {
  if (isLast) return null;

  return (
    <div
      className={cn(
        'absolute left-4 top-8 h-full w-0.5 -translate-x-1/2',
        isCompleted ? 'bg-green-300' : 'bg-gray-200'
      )}
    />
  );
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'completed';

        return (
          <div key={step.id} className="relative pb-8 last:pb-0">
            <StepConnector isLast={isLast} isCompleted={isCompleted} />

            <div className="flex items-start gap-4">
              <StepIcon status={step.status} />

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'font-medium',
                      step.status === 'pending' && 'text-gray-400',
                      step.status === 'in_progress' && 'text-blue-600',
                      step.status === 'completed' && 'text-gray-900',
                      step.status === 'failed' && 'text-red-600'
                    )}
                  >
                    {step.label}
                  </span>

                  {step.timestamp && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(step.timestamp), 'HH:mm:ss')}
                    </span>
                  )}
                </div>

                {step.error && (
                  <p className="mt-1 text-sm text-red-600">{step.error}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
