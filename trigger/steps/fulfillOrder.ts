import { task } from "@trigger.dev/sdk/v3";
import type { FulfillStepPayload } from "../types";
import {
  updateOrderStatus,
  getInventoryByProductWarehouse,
  updateInventoryQuantities,
  createStockMovement,
} from "../supabase";

export const fulfillOrderTask = task({
  id: "fulfill-order",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },

  run: async (payload: FulfillStepPayload) => {
    const { orderId, warehouseId, items, correlationId } = payload;

    // Update order status to fulfilling
    await updateOrderStatus(orderId, "fulfilling");

    // Fulfill each item
    for (const item of items) {
      const inventory = await getInventoryByProductWarehouse(
        item.productId,
        warehouseId
      );

      if (!inventory) {
        throw new Error(`Inventory not found for product ${item.productId}`);
      }

      // Create fulfill movement record
      await createStockMovement({
        correlationId,
        productId: item.productId,
        warehouseId,
        movementType: "fulfill",
        quantity: item.quantity,
        referenceId: orderId,
        referenceType: "order",
      });

      // Update inventory quantities
      await updateInventoryQuantities(inventory.id, {
        quantity_available: inventory.quantity_available - item.quantity,
        quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
      });
    }

    return { fulfilled: true, itemCount: items.length };
  },
});
