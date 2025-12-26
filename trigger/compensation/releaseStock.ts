import { task } from "@trigger.dev/sdk/v3";
import type { ReleaseStockPayload } from "../types";
import {
  getInventoryByProductWarehouse,
  updateInventoryQuantities,
  createStockMovement,
} from "../supabase";

export const releaseStockTask = task({
  id: "release-stock",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 60000,
  },

  run: async (payload: ReleaseStockPayload) => {
    const { orderId, warehouseId, items, correlationId } = payload;

    for (const item of items) {
      const inventory = await getInventoryByProductWarehouse(
        item.productId,
        warehouseId
      );

      if (inventory) {
        // Create release movement record
        await createStockMovement({
          correlationId,
          productId: item.productId,
          warehouseId,
          movementType: "release",
          quantity: item.quantity,
          referenceId: orderId,
          referenceType: "order",
          notes: "Saga compensation - stock release",
        });

        // Update inventory quantities
        await updateInventoryQuantities(inventory.id, {
          quantity_reserved: Math.max(0, inventory.quantity_reserved - item.quantity),
        });
      }
    }

    return { released: true, itemCount: items.length };
  },
});
