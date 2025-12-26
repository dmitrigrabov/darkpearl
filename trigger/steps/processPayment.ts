import { task } from "@trigger.dev/sdk/v3";
import { randomUUID } from "crypto";
import type { PaymentStepPayload } from "../types";
import { updateOrderStatus, updateOrder } from "../supabase";

export const processPaymentTask = task({
  id: "process-payment",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },

  run: async (payload: PaymentStepPayload) => {
    const { orderId, totalAmount } = payload;

    // Update order status to payment processing
    await updateOrderStatus(orderId, "payment_processing");

    // Simulate payment processing
    // In production, this would call an actual payment gateway
    const paymentSuccess = Math.random() > 0.1;

    if (!paymentSuccess) {
      await updateOrderStatus(orderId, "payment_failed");
      throw new Error("Payment declined by payment processor");
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${randomUUID().slice(0, 8)}`;

    // Update order with payment info
    await updateOrder(orderId, {
      payment_reference: paymentReference,
      status: "paid",
    });

    return { paymentReference, totalAmount };
  },
});
