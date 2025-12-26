import { task } from "@trigger.dev/sdk/v3";
import type { OrderFulfillmentPayload } from "./types";
import {
  createSagaRecord,
  getSagaByCorrelationId,
  updateSagaStatus,
  updateSagaStep,
  updateOrderStatus,
  recordSagaEvent,
} from "./supabase";
import { reserveStockTask } from "./steps/reserveStock";
import { processPaymentTask } from "./steps/processPayment";
import { fulfillOrderTask } from "./steps/fulfillOrder";
import { compensateOrderSaga } from "./compensation/compensateOrderSaga";

function calculateTotal(items: OrderFulfillmentPayload["items"]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export const orderFulfillmentSaga = task({
  id: "order-fulfillment-saga",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
  },

  run: async (payload: OrderFulfillmentPayload, { ctx }) => {
    const { orderId, warehouseId, items, correlationId } = payload;

    // Check for existing saga (idempotency)
    const existingSaga = await getSagaByCorrelationId(correlationId);
    if (existingSaga) {
      console.log(`Saga already exists for order ${orderId}, skipping`);
      return { status: "skipped", sagaId: existingSaga.id, reason: "saga_exists" };
    }

    // Create saga record
    const saga = await createSagaRecord(
      correlationId,
      { order_id: orderId, warehouse_id: warehouseId, items },
      ctx.run.id
    );

    console.log(`Created saga ${saga.id} for order ${orderId}`);

    let paymentReference: string | undefined;

    try {
      // Step 1: Reserve Stock
      await updateSagaStep(saga.id, "reserve_stock", "step_executing");
      await recordSagaEvent(saga.id, "reserve_stock", "step_started");

      const reserveResult = await reserveStockTask.triggerAndWait({
        sagaId: saga.id,
        orderId,
        warehouseId,
        items,
        correlationId,
      });

      await recordSagaEvent(saga.id, "reserve_stock", "step_completed", reserveResult);
      await updateSagaStep(saga.id, "reserve_stock", "step_completed");
      console.log(`Saga ${saga.id}: reserve_stock completed`);

      // Step 2: Process Payment (checkpoint occurs here during wait)
      await updateSagaStep(saga.id, "process_payment", "step_executing");
      await recordSagaEvent(saga.id, "process_payment", "step_started");

      const paymentResult = await processPaymentTask.triggerAndWait({
        sagaId: saga.id,
        orderId,
        totalAmount: calculateTotal(items),
      });

      paymentReference = paymentResult.paymentReference;
      await recordSagaEvent(saga.id, "process_payment", "step_completed", paymentResult);
      await updateSagaStep(saga.id, "process_payment", "step_completed");
      console.log(`Saga ${saga.id}: process_payment completed`);

      // Step 3: Fulfill Order (checkpoint occurs here during wait)
      await updateSagaStep(saga.id, "fulfill_order", "step_executing");
      await recordSagaEvent(saga.id, "fulfill_order", "step_started");

      const fulfillResult = await fulfillOrderTask.triggerAndWait({
        sagaId: saga.id,
        orderId,
        warehouseId,
        items,
        correlationId,
        paymentReference,
      });

      await recordSagaEvent(saga.id, "fulfill_order", "step_completed", fulfillResult);
      await updateSagaStep(saga.id, "fulfill_order", "step_completed");
      console.log(`Saga ${saga.id}: fulfill_order completed`);

      // Mark saga as completed
      await updateSagaStatus(saga.id, "completed");
      await updateOrderStatus(orderId, "fulfilled");

      console.log(`Saga ${saga.id}: All steps completed successfully`);

      return {
        status: "completed",
        sagaId: saga.id,
        paymentReference,
      };
    } catch (error) {
      // Record failure - compensation will be triggered by onFailure
      const currentStep = saga.current_step || "unknown";
      await recordSagaEvent(saga.id, currentStep, "step_failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      console.error(`Saga ${saga.id}: Failed at step`, error);
      throw error; // Re-throw to trigger onFailure
    }
  },

  // Compensation logic when saga fails after all retries
  onFailure: async ({ payload, error, ctx }) => {
    console.log(
      `Saga failed for order ${payload.orderId}, triggering compensation. Error: ${error.message}`
    );

    // Trigger compensation as a separate durable task
    await compensateOrderSaga.trigger({
      correlationId: payload.correlationId,
      orderId: payload.orderId,
      warehouseId: payload.warehouseId,
      items: payload.items,
      triggerRunId: ctx.run.id,
    });
  },
});
