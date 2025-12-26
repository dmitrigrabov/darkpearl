import { task } from "@trigger.dev/sdk/v3";
import type { VoidPaymentPayload } from "../types";
import { updateOrder } from "../supabase";

export const voidPaymentTask = task({
  id: "void-payment",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 60000,
  },

  run: async (payload: VoidPaymentPayload) => {
    const { orderId, paymentReference } = payload;

    // In production, this would call the payment gateway to void/refund
    console.log(`Voiding payment: ${paymentReference}`);

    await updateOrder(orderId, {
      notes: `Payment voided: ${paymentReference || "N/A"}`,
    });

    return { voided: true, paymentReference };
  },
});
