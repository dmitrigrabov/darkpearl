import { createServiceClient } from '../_shared/supabase-client.ts';
import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import type {
  SagaStepType,
  SagaStatus,
  Saga,
  OrderFulfillmentPayload,
} from '../_shared/types.ts';

// Define saga steps in order
const SAGA_STEPS: SagaStepType[] = ['reserve_stock', 'process_payment', 'fulfill_order'];

// Map forward steps to their compensation actions
const COMPENSATION_MAP: Record<string, SagaStepType> = {
  reserve_stock: 'release_stock',
  process_payment: 'void_payment',
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    const body = await req.json();
    const { saga_id, action } = body;

    if (!saga_id || !action) {
      return errorResponse('saga_id and action are required');
    }

    // Fetch saga state
    const { data: saga, error: sagaError } = await supabase
      .from('sagas')
      .select('*')
      .eq('id', saga_id)
      .single();

    if (sagaError || !saga) {
      return errorResponse('Saga not found', 404);
    }

    const payload = saga.payload as OrderFulfillmentPayload;

    console.log(`Saga ${saga_id}: Processing action "${action}", current status: ${saga.status}`);

    // Process based on action
    switch (action) {
      case 'execute_next':
        return await executeNextStep(supabase, saga, payload);

      case 'step_completed':
        return await handleStepCompletion(supabase, saga, payload, body.step_result);

      case 'step_failed':
        return await handleStepFailure(supabase, saga, payload, body.error);

      case 'compensate':
        return await startCompensation(supabase, saga, payload);

      default:
        return errorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    console.error('Saga orchestrator error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

/**
 * Execute the next step in the saga
 */
async function executeNextStep(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  const currentIndex = saga.current_step ? SAGA_STEPS.indexOf(saga.current_step) : -1;
  const nextStep = SAGA_STEPS[currentIndex + 1];

  if (!nextStep) {
    // All steps completed successfully
    await updateSagaStatus(supabase, saga.id, 'completed', null);
    await updateOrderStatus(supabase, payload.order_id, 'fulfilled');

    console.log(`Saga ${saga.id}: All steps completed successfully`);
    return jsonResponse({ status: 'saga_completed', saga_id: saga.id });
  }

  // Update saga to show we're executing next step
  await supabase
    .from('sagas')
    .update({
      current_step: nextStep,
      status: 'step_executing',
    })
    .eq('id', saga.id);

  // Record step start event
  await recordSagaEvent(supabase, saga.id, nextStep, 'step_started', {});

  console.log(`Saga ${saga.id}: Executing step "${nextStep}"`);

  try {
    // Execute the step
    const result = await executeStep(supabase, saga, nextStep, payload);

    // Record success
    await recordSagaEvent(supabase, saga.id, nextStep, 'step_completed', result);

    // Update saga
    await supabase
      .from('sagas')
      .update({
        status: 'step_completed',
        payload: { ...payload, ...result.updatedPayload },
      })
      .eq('id', saga.id);

    console.log(`Saga ${saga.id}: Step "${nextStep}" completed successfully`);

    // Continue to next step
    return await executeNextStep(supabase, { ...saga, current_step: nextStep }, {
      ...payload,
      ...result.updatedPayload,
    });
  } catch (error) {
    console.error(`Saga ${saga.id}: Step "${nextStep}" failed:`, error);

    // Record failure
    await recordSagaEvent(supabase, saga.id, nextStep, 'step_failed', {
      error: error.message,
    });

    // Start compensation
    return await startCompensation(supabase, { ...saga, current_step: nextStep }, payload);
  }
}

/**
 * Execute a specific saga step
 */
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
      return await processPayment(supabase, saga, payload);

    case 'fulfill_order':
      return await fulfillOrder(supabase, saga, payload);

    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

/**
 * Reserve stock for all order items
 */
async function reserveStock(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  await updateOrderStatus(supabase, payload.order_id, 'reserved');

  for (const item of payload.items) {
    // Get current inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', payload.warehouse_id)
      .single();

    if (invError || !inventory) {
      throw new Error(`No inventory found for product ${item.product_id} in warehouse ${payload.warehouse_id}`);
    }

    const available = inventory.quantity_available - inventory.quantity_reserved;
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product_id}: need ${item.quantity}, available ${available}`
      );
    }

    // Reserve stock (idempotent via unique constraint)
    const { error: movementError } = await supabase
      .from('stock_movements')
      .upsert(
        {
          correlation_id: saga.correlation_id,
          product_id: item.product_id,
          warehouse_id: payload.warehouse_id,
          movement_type: 'reserve',
          quantity: item.quantity,
          reference_id: payload.order_id,
          reference_type: 'order',
        },
        {
          onConflict: 'correlation_id,movement_type,product_id,warehouse_id',
          ignoreDuplicates: true,
        }
      );

    if (movementError) {
      console.log('Movement upsert result:', movementError);
      // Ignore duplicate errors (idempotent)
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity_reserved: inventory.quantity_reserved + item.quantity,
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;
  }

  return { updatedPayload: {} };
}

/**
 * Process payment (mock implementation)
 */
async function processPayment(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  await updateOrderStatus(supabase, payload.order_id, 'payment_processing');

  // Simulate payment processing
  // In production, this would call a payment gateway
  const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

  if (!paymentSuccess) {
    await updateOrderStatus(supabase, payload.order_id, 'payment_failed');
    throw new Error('Payment declined by payment processor');
  }

  const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update order with payment reference
  await supabase
    .from('orders')
    .update({
      payment_reference: paymentReference,
      status: 'paid',
    })
    .eq('id', payload.order_id);

  return {
    updatedPayload: { payment_reference: paymentReference },
  };
}

/**
 * Fulfill order - deduct stock from inventory
 */
async function fulfillOrder(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  await updateOrderStatus(supabase, payload.order_id, 'fulfilling');

  for (const item of payload.items) {
    // Get current inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', payload.warehouse_id)
      .single();

    if (invError || !inventory) {
      throw new Error(`Inventory not found for product ${item.product_id}`);
    }

    // Record fulfillment movement (idempotent)
    await supabase
      .from('stock_movements')
      .upsert(
        {
          correlation_id: saga.correlation_id,
          product_id: item.product_id,
          warehouse_id: payload.warehouse_id,
          movement_type: 'fulfill',
          quantity: item.quantity,
          reference_id: payload.order_id,
          reference_type: 'order',
        },
        {
          onConflict: 'correlation_id,movement_type,product_id,warehouse_id',
          ignoreDuplicates: true,
        }
      );

    // Update inventory: reduce both available and reserved
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity_available: inventory.quantity_available - item.quantity,
        quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;
  }

  return { updatedPayload: {} };
}

/**
 * Start compensation process
 */
async function startCompensation(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  console.log(`Saga ${saga.id}: Starting compensation from step "${saga.current_step}"`);

  await supabase
    .from('sagas')
    .update({ status: 'compensating' })
    .eq('id', saga.id);

  // Find the index of the failed step
  const failedIndex = saga.current_step ? SAGA_STEPS.indexOf(saga.current_step) : -1;

  // Compensate all completed steps in reverse order
  for (let i = failedIndex - 1; i >= 0; i--) {
    const stepToCompensate = SAGA_STEPS[i];
    const compensationStep = COMPENSATION_MAP[stepToCompensate];

    if (compensationStep) {
      console.log(`Saga ${saga.id}: Executing compensation "${compensationStep}" for "${stepToCompensate}"`);

      await recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_started', {});

      try {
        await executeCompensationStep(supabase, saga, compensationStep, payload);
        await recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_completed', {});
      } catch (error) {
        console.error(`Saga ${saga.id}: Compensation "${compensationStep}" failed:`, error);
        await recordSagaEvent(supabase, saga.id, compensationStep, 'compensation_failed', {
          error: error.message,
        });
        // Continue with other compensations even if one fails
      }
    }
  }

  // Mark saga as failed
  await updateSagaStatus(supabase, saga.id, 'failed', 'Saga failed and compensated');
  await updateOrderStatus(supabase, payload.order_id, 'cancelled');

  console.log(`Saga ${saga.id}: Compensation completed, saga marked as failed`);
  return jsonResponse({ status: 'compensation_completed', saga_id: saga.id });
}

/**
 * Execute a compensation step
 */
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
      return await voidPayment(supabase, saga, payload);

    default:
      console.log(`No compensation action for step: ${step}`);
  }
}

/**
 * Release reserved stock (compensation for reserve_stock)
 */
async function releaseStock(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  for (const item of payload.items) {
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', payload.warehouse_id)
      .single();

    if (inventory) {
      // Record release movement
      await supabase
        .from('stock_movements')
        .upsert(
          {
            correlation_id: saga.correlation_id,
            product_id: item.product_id,
            warehouse_id: payload.warehouse_id,
            movement_type: 'release',
            quantity: item.quantity,
            reference_id: payload.order_id,
            reference_type: 'order',
            notes: 'Saga compensation - stock release',
          },
          {
            onConflict: 'correlation_id,movement_type,product_id,warehouse_id',
            ignoreDuplicates: true,
          }
        );

      // Update inventory
      await supabase
        .from('inventory')
        .update({
          quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
        })
        .eq('id', inventory.id);
    }
  }
}

/**
 * Void payment (compensation for process_payment)
 */
async function voidPayment(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload
) {
  // In production, this would call the payment gateway to void/refund
  console.log(`Voiding payment: ${payload.payment_reference}`);

  // Update order to reflect voided payment
  await supabase
    .from('orders')
    .update({
      notes: `Payment voided: ${payload.payment_reference}`,
    })
    .eq('id', payload.order_id);
}

// Helper functions

async function updateSagaStatus(
  supabase: ReturnType<typeof createServiceClient>,
  sagaId: string,
  status: SagaStatus,
  errorMessage: string | null
) {
  const update: Record<string, unknown> = { status };
  if (status === 'completed' || status === 'failed') {
    update.completed_at = new Date().toISOString();
  }
  if (errorMessage) {
    update.error_message = errorMessage;
  }
  await supabase.from('sagas').update(update).eq('id', sagaId);
}

async function updateOrderStatus(
  supabase: ReturnType<typeof createServiceClient>,
  orderId: string,
  status: string
) {
  await supabase.from('orders').update({ status }).eq('id', orderId);
}

async function recordSagaEvent(
  supabase: ReturnType<typeof createServiceClient>,
  sagaId: string,
  stepType: SagaStepType,
  eventType: string,
  eventPayload: Record<string, unknown>
) {
  await supabase.from('saga_events').insert({
    saga_id: sagaId,
    step_type: stepType,
    event_type: eventType,
    payload: eventPayload,
  });
}

async function handleStepCompletion(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload,
  stepResult?: Record<string, unknown>
) {
  // Record completion and continue
  if (saga.current_step) {
    await recordSagaEvent(supabase, saga.id, saga.current_step, 'step_completed', stepResult || {});
  }
  return await executeNextStep(supabase, saga, payload);
}

async function handleStepFailure(
  supabase: ReturnType<typeof createServiceClient>,
  saga: Saga,
  payload: OrderFulfillmentPayload,
  error?: string
) {
  if (saga.current_step) {
    await recordSagaEvent(supabase, saga.id, saga.current_step, 'step_failed', { error });
  }
  return await startCompensation(supabase, saga, payload);
}
