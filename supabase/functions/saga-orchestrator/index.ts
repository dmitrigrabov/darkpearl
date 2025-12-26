import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createServiceClient } from '../_shared/supabase-client.ts';
import type { SagaStepType, Saga, OrderFulfillmentPayload } from '../_shared/types.ts';
import * as sagaService from '../_shared/services/saga-service.ts';
import * as orderService from '../_shared/services/order-service.ts';
import * as inventoryService from '../_shared/services/inventory-service.ts';
import * as stockMovementService from '../_shared/services/stock-movement-service.ts';

// Define saga steps in order
const SAGA_STEPS: SagaStepType[] = ['reserve_stock', 'process_payment', 'fulfill_order'];

// Map forward steps to their compensation actions
const COMPENSATION_MAP: Record<string, SagaStepType> = {
  reserve_stock: 'release_stock',
  process_payment: 'void_payment',
};

type Variables = {
  serviceClient: ReturnType<typeof createServiceClient>;
};

const app = new Hono<{ Variables: Variables }>();

app.use('/saga-orchestrator/*', cors());

app.use('/saga-orchestrator/*', async (c, next) => {
  c.set('serviceClient', createServiceClient());
  await next();
});

app.onError((err, c) => {
  console.error('Saga orchestrator error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.post('/saga-orchestrator', async (c) => {
  const supabase = c.get('serviceClient');
  const body = await c.req.json();
  const { saga_id, action } = body;

  if (!saga_id || !action) {
    return c.json({ error: 'saga_id and action are required' }, 400);
  }

  const saga = await sagaService.getSaga(supabase, saga_id);
  if (!saga) {
    return c.json({ error: 'Saga not found' }, 404);
  }

  const payload = saga.payload as OrderFulfillmentPayload;
  console.log(`Saga ${saga_id}: Processing action "${action}", current status: ${saga.status}`);

  switch (action) {
    case 'execute_next':
      return await executeNextStep(c, supabase, saga, payload);
    case 'step_completed':
      return await handleStepCompletion(c, supabase, saga, payload, body.step_result);
    case 'step_failed':
      return await handleStepFailure(c, supabase, saga, payload, body.error);
    case 'compensate':
      return await startCompensation(c, supabase, saga, payload);
    default:
      return c.json({ error: `Unknown action: ${action}` }, 400);
  }
});

Deno.serve(app.fetch);

async function executeNextStep(
  c: { json: (data: unknown, status?: number) => Response },
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  const currentIndex = saga.current_step ? SAGA_STEPS.indexOf(saga.current_step) : -1;
  const nextStep = SAGA_STEPS[currentIndex + 1];

  if (!nextStep) {
    await sagaService.updateSagaStatus(supabase, saga.id, 'completed', null);
    await orderService.updateOrderStatus(supabase, payload.order_id, 'fulfilled');
    
    console.log(`Saga ${saga.id}: All steps completed successfully`);

    return c.json({ status: 'saga_completed', saga_id: saga.id });
  }

  await sagaService.updateSagaStep(supabase, saga.id, nextStep, 'step_executing');
  await sagaService.recordSagaEvent(supabase, saga.id, nextStep, 'step_started', {});

  console.log(`Saga ${saga.id}: Executing step "${nextStep}"`);

  try {
    const result = await executeStep(supabase, saga, nextStep, payload);

    await sagaService.recordSagaEvent(supabase, saga.id, nextStep, 'step_completed', result);
    await sagaService.updateSagaStep(
      supabase,
      saga.id,
      nextStep,
      'step_completed',
      { ...payload, ...result.updatedPayload }
    );

    console.log(`Saga ${saga.id}: Step "${nextStep}" completed successfully`);

    return await executeNextStep(c, supabase, { ...saga, current_step: nextStep }, {
      ...payload,
      ...result.updatedPayload,
    });

  } catch (err) {
    const error = err as Error;
    console.error(`Saga ${saga.id}: Step "${nextStep}" failed:`, error);

    await sagaService.recordSagaEvent(supabase, saga.id, nextStep, 'step_failed', {
      error: error.message,
    });

    return await startCompensation(c, supabase, { ...saga, current_step: nextStep }, payload);
  }
}

async function executeStep(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  step: SagaStepType,
  payload: OrderFulfillmentPayload
): Promise<{ updatedPayload?: Partial<OrderFulfillmentPayload> }> {
  switch (step) {
    case 'reserve_stock':
      return await reserveStock(supabase, saga, payload);
    case 'process_payment':
      return await processPayment(supabase, payload);
    case 'fulfill_order':
      return await fulfillOrder(supabase, saga, payload);
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

async function reserveStock(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  await orderService.updateOrderStatus(supabase, payload.order_id, 'reserved');

  for (const item of payload.items) {
    const inventory = await inventoryService.getInventoryByProductWarehouse(
      supabase,
      item.product_id,
      payload.warehouse_id
    );

    if (!inventory) {
      throw new Error(`No inventory found for product ${item.product_id} in warehouse ${payload.warehouse_id}`);
    }

    const available = inventory.quantity_available - inventory.quantity_reserved;
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product_id}: need ${item.quantity}, available ${available}`
      );
    }

    await stockMovementService.upsertMovement(supabase, {
      correlation_id: saga.correlation_id,
      product_id: item.product_id,
      warehouse_id: payload.warehouse_id,
      movement_type: 'reserve',
      quantity: item.quantity,
      reference_id: payload.order_id,
      reference_type: 'order',
    });

    await inventoryService.updateInventoryQuantities(supabase, inventory.id, {
      quantity_reserved: inventory.quantity_reserved + item.quantity,
    });
  }

  return { updatedPayload: {} };
}

async function processPayment(
  supabase: ReturnType<typeof createServiceClient>,
  payload: OrderFulfillmentPayload
) {
  await orderService.updateOrderStatus(supabase, payload.order_id, 'payment_processing');

  // Simulate payment processing
  const paymentSuccess = Math.random() > 0.1;

  if (!paymentSuccess) {
    await orderService.updateOrderStatus(supabase, payload.order_id, 'payment_failed');
    throw new Error('Payment declined by payment processor');
  }

  const paymentReference = `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;

  await orderService.updateOrder(supabase, payload.order_id, {
    payment_reference: paymentReference,
    status: 'paid',
  });

  return { updatedPayload: { payment_reference: paymentReference } };
}

async function fulfillOrder(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  await orderService.updateOrderStatus(supabase, payload.order_id, 'fulfilling');

  for (const item of payload.items) {
    const inventory = await inventoryService.getInventoryByProductWarehouse(
      supabase,
      item.product_id,
      payload.warehouse_id
    );

    if (!inventory) {
      throw new Error(`Inventory not found for product ${item.product_id}`);
    }

    await stockMovementService.upsertMovement(supabase, {
      correlation_id: saga.correlation_id,
      product_id: item.product_id,
      warehouse_id: payload.warehouse_id,
      movement_type: 'fulfill',
      quantity: item.quantity,
      reference_id: payload.order_id,
      reference_type: 'order',
    });

    await inventoryService.updateInventoryQuantities(supabase, inventory.id, {
      quantity_available: inventory.quantity_available - item.quantity,
      quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
    });
  }

  return { updatedPayload: {} };
}

async function startCompensation(
  c: { json: (data: unknown, status?: number) => Response },
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  console.log(`Saga ${saga.id}: Starting compensation from step "${saga.current_step}"`);

  await sagaService.updateSagaStatus(supabase, saga.id, 'compensating');

  const failedIndex = saga.current_step ? SAGA_STEPS.indexOf(saga.current_step) : -1;

  for (let i = failedIndex - 1; i >= 0; i--) {
    const stepToCompensate = SAGA_STEPS[i];
    const compensationStep = COMPENSATION_MAP[stepToCompensate];

    if (compensationStep) {
      console.log(`Saga ${saga.id}: Executing compensation "${compensationStep}" for "${stepToCompensate}"`);
      await sagaService.recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_started', {});

      try {
        await executeCompensationStep(supabase, saga, compensationStep, payload);
        await sagaService.recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_completed', {});
      } catch (err) {
        const error = err as Error;
        console.error(`Saga ${saga.id}: Compensation "${compensationStep}" failed:`, error);
        await sagaService.recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_failed', {
          error: error.message,
        });
      }
    }
  }

  await sagaService.updateSagaStatus(supabase, saga.id, 'failed', 'Saga failed and compensated');
  await orderService.updateOrderStatus(supabase, payload.order_id, 'cancelled');

  console.log(`Saga ${saga.id}: Compensation completed, saga marked as failed`);
  return c.json({ status: 'compensation_completed', saga_id: saga.id });
}

async function executeCompensationStep(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  step: SagaStepType,
  payload: OrderFulfillmentPayload
) {
  switch (step) {
    case 'release_stock':
      return await releaseStock(supabase, saga, payload);
    case 'void_payment':
      return await voidPayment(supabase, payload);
    default:
      console.log(`No compensation action for step: ${step}`);
  }
}

async function releaseStock(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  for (const item of payload.items) {
    const inventory = await inventoryService.getInventoryByProductWarehouse(
      supabase,
      item.product_id,
      payload.warehouse_id
    );

    if (inventory) {
      await stockMovementService.upsertMovement(supabase, {
        correlation_id: saga.correlation_id,
        product_id: item.product_id,
        warehouse_id: payload.warehouse_id,
        movement_type: 'release',
        quantity: item.quantity,
        reference_id: payload.order_id,
        reference_type: 'order',
        notes: 'Saga compensation - stock release',
      });

      await inventoryService.updateInventoryQuantities(supabase, inventory.id, {
        quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
      });
    }
  }
}

async function voidPayment(
  supabase: ReturnType<typeof createServiceClient>,
  payload: OrderFulfillmentPayload
) {
  console.log(`Voiding payment: ${payload.payment_reference}`);

  await orderService.updateOrder(supabase, payload.order_id, {
    notes: `Payment voided: ${payload.payment_reference}`,
  });
}

async function handleStepCompletion(
  c: { json: (data: unknown, status?: number) => Response },
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload,
  stepResult?: Record<string, unknown>
) {
  if (saga.current_step) {
    await sagaService.recordSagaEvent(supabase, saga.id, saga.current_step, 'step_completed', stepResult || {});
  }
  return await executeNextStep(c, supabase, saga, payload);
}

async function handleStepFailure(
  c: { json: (data: unknown, status?: number) => Response },
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload,
  error?: string
) {
  if (saga.current_step) {
    await sagaService.recordSagaEvent(supabase, saga.id, saga.current_step, 'step_failed', { error });
  }
  return await startCompensation(c, supabase, saga, payload);
}
