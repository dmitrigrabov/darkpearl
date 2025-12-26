import { task } from "@trigger.dev/sdk/v3";
import type { CompensationPayload } from "../types";
import {
  getSagaByCorrelationId,
  getCompletedSteps,
  updateSagaStatus,
  updateOrderStatus,
  recordSagaEvent,
} from "../supabase";
import { releaseStockTask } from "./releaseStock";
import { voidPaymentTask } from "./voidPayment";

// Map forward steps to their compensation actions
const COMPENSATION_MAP: Record<string, { step: string; task: typeof releaseStockTask | typeof voidPaymentTask }> = {
  reserve_stock: { step: "release_stock", task: releaseStockTask },
  process_payment: { step: "void_payment", task: voidPaymentTask },
};

export const compensateOrderSaga = task({
  id: "compensate-order-saga",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 120000,
  },

  run: async (payload: CompensationPayload) => {
    const { correlationId, orderId, warehouseId, items } = payload;

    // Get saga record
    const saga = await getSagaByCorrelationId(correlationId);
    if (!saga) {
      throw new Error(`Saga not found for correlation_id ${correlationId}`);
    }

    // Get completed steps from saga_events
    const completedSteps = await getCompletedSteps(saga.id);
    const completedStepsSet = new Set(completedSteps);

    // Update saga status to compensating
    await updateSagaStatus(saga.id, "compensating");

    // Run compensations in reverse order
    const stepsToCompensate = ["process_payment", "reserve_stock"];

    for (const step of stepsToCompensate) {
      if (completedStepsSet.has(step)) {
        const compensation = COMPENSATION_MAP[step];
        if (!compensation) continue;

        await recordSagaEvent(saga.id, compensation.step, "compensation_started");

        try {
          if (step === "reserve_stock") {
            await releaseStockTask.triggerAndWait({
              sagaId: saga.id,
              orderId,
              warehouseId,
              items,
              correlationId,
            });
          } else if (step === "process_payment") {
            await voidPaymentTask.triggerAndWait({
              sagaId: saga.id,
              orderId,
              paymentReference: (saga.payload as Record<string, unknown>)?.payment_reference as string,
            });
          }

          await recordSagaEvent(saga.id, compensation.step, "compensation_completed");
        } catch (error) {
          await recordSagaEvent(saga.id, compensation.step, "compensation_failed", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          throw error; // Re-throw to trigger retry
        }
      }
    }

    // Mark saga as failed (compensation complete)
    await updateSagaStatus(saga.id, "failed", "Saga failed and compensated");

    // Update order status to cancelled
    await updateOrderStatus(orderId, "cancelled");

    return { compensated: true, sagaId: saga.id };
  },
});
