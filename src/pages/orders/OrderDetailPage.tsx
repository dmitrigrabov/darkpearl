import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, useCancelOrder } from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { Stepper, type Step, type StepStatus } from '@/components/ui/stepper';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderStatus, SagaEvent } from '@/types/api.types';

const STATUS_COLORS: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  reserved: 'default',
  payment_processing: 'secondary',
  payment_failed: 'destructive',
  paid: 'default',
  fulfilling: 'secondary',
  fulfilled: 'default',
  cancelled: 'destructive',
};

const SAGA_STEPS = [
  { id: 'reserve_stock', label: 'Reserve Stock' },
  { id: 'process_payment', label: 'Process Payment' },
  { id: 'fulfill_order', label: 'Fulfill Order' },
] as const;

function buildStepsFromSaga(
  events: SagaEvent[],
  currentStep: string | null,
  sagaStatus: string,
  errorMessage: string | null
): Step[] {
  return SAGA_STEPS.map((stepDef) => {
    const startedEvent = events.find(
      (e) => e.step_type === stepDef.id && e.event_type === 'step_started'
    );
    const completedEvent = events.find(
      (e) => e.step_type === stepDef.id && e.event_type === 'step_completed'
    );
    const failedEvent = events.find(
      (e) => e.step_type === stepDef.id && e.event_type === 'step_failed'
    );

    let status: StepStatus = 'pending';
    let timestamp: string | undefined;
    let error: string | undefined;

    if (failedEvent) {
      status = 'failed';
      timestamp = failedEvent.created_at;
      error = errorMessage ?? (failedEvent.payload?.error as string);
    } else if (completedEvent) {
      status = 'completed';
      timestamp = completedEvent.created_at;
    } else if (startedEvent || currentStep === stepDef.id) {
      status = 'in_progress';
      timestamp = startedEvent?.created_at;
    }

    return {
      id: stepDef.id,
      label: stepDef.label,
      status,
      timestamp,
      error,
    };
  });
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: order, isLoading } = useOrder(id!);
  const cancelMutation = useCancelOrder();

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelMutation.mutateAsync(id!);
      toast({ title: 'Order cancelled successfully' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }

  const canCancel = ['pending', 'reserved', 'payment_failed'].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
        <Badge variant={STATUS_COLORS[order.status as OrderStatus]}>
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number</span>
              <span>{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warehouse</span>
              <span>{order.warehouse?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}</span>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notes</span>
                <span>{order.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {order.saga && (
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Stepper
                steps={buildStepsFromSaga(
                  order.saga.events,
                  order.saga.current_step,
                  order.saga.status,
                  order.saga.error_message
                )}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    {item.product?.sku} - {item.product?.name}
                  </td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="text-right py-2">
                    ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right py-2 font-medium">
                  Total
                </td>
                <td className="text-right py-2 font-medium">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {canCancel && (
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      )}
    </div>
  );
}
