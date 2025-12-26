import { task } from "@trigger.dev/sdk/v3";
import type { StepPayload } from "../types";
import {
  updateOrderStatus,
  getInventoryByProductWarehouse,
  updateInventoryQuantities,
  createStockMovement,
} from "../supabase";

export const reserveStockTask = task({
  id: "reserve-stock",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },

  run: async (payload: StepPayload) => {
    const { orderId, warehouseId, items, correlationId } = payload;

    // Update order status to reserved
    await updateOrderStatus(orderId, "reserved");

    // Reserve stock for each item
    for (const item of items) {
      const inventory = await getInventoryByProductWarehouse(
        item.productId,
        warehouseId
      );

      if (!inventory) {
        throw new Error(
          `No inventory found for product ${item.productId} in warehouse ${warehouseId}`
        );
      }

      const available = inventory.quantity_available - inventory.quantity_reserved;
      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productId}: need ${item.quantity}, available ${available}`
        );
      }

      // Create stock movement record
      await createStockMovement({
        correlationId,
        productId: item.productId,
        warehouseId,
        movementType: "reserve",
        quantity: item.quantity,
        referenceId: orderId,
        referenceType: "order",
      });

      // Update inventory quantities
      await updateInventoryQuantities(inventory.id, {
        quantity_reserved: inventory.quantity_reserved + item.quantity,
      });
    }

    return { reserved: true, itemCount: items.length };
  },
});
