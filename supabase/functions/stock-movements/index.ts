import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../_shared/database.types.ts';
import type { CreateStockMovementRequest, MovementType } from '../_shared/types.ts';
import { supabaseMiddleware } from '../_shared/middleware.ts';
import * as stockMovementService from '../_shared/services/stock-movement-service.ts';
import * as inventoryService from '../_shared/services/inventory-service.ts';
import { match, P } from 'ts-pattern';

const VALID_MOVEMENT_TYPES: MovementType[] = [
  'receive',
  'transfer_out',
  'transfer_in',
  'adjust',
  'reserve',
  'release',
  'fulfill',
];

type Env = {
  Variables: {
    supabase: SupabaseClient<Database>;
  };
};

const app = new Hono<Env>();

app.use('/stock-movements/*', cors());
app.use('/stock-movements/*', supabaseMiddleware);

app.onError((err, c) => {
  console.error('Stock movements error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/stock-movements', async (c) => {
  const client = c.get('supabase');
  const productId = c.req.query('product_id');
  const warehouseId = c.req.query('warehouse_id');
  const movementType = c.req.query('movement_type') as MovementType | undefined;
  const referenceId = c.req.query('reference_id');
  const correlationId = c.req.query('correlation_id');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  const result = await stockMovementService.listMovements(client, {
    productId,
    warehouseId,
    movementType,
    referenceId,
    correlationId,
    limit,
    offset,
  });

  return c.json(result);
});

app.get('/stock-movements/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const result = await stockMovementService.getMovement(client, id);

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Stock movement not found' }, 404))
    .otherwise(() => {
      throw result.error;
    });
});

app.post('/stock-movements', async (c) => {
  const client = c.get('supabase');
  const body: CreateStockMovementRequest = await c.req.json();

  if (!body.product_id || !body.warehouse_id || !body.movement_type || body.quantity === undefined) {
    return c.json({ error: 'product_id, warehouse_id, movement_type, and quantity are required' }, 400);
  }

  if (!VALID_MOVEMENT_TYPES.includes(body.movement_type)) {
    return c.json({ error: `Invalid movement_type. Must be one of: ${VALID_MOVEMENT_TYPES.join(', ')}` }, 400);
  }

  // Get current inventory
  const inventory = await inventoryService.getInventoryByProductWarehouse(
    client,
    body.product_id,
    body.warehouse_id
  );

  const correlationId = body.correlation_id || crypto.randomUUID();

  let newAvailable = inventory?.quantity_available || 0;
  let newReserved = inventory?.quantity_reserved || 0;

  switch (body.movement_type) {
    case 'receive':
    case 'transfer_in':
      newAvailable += body.quantity;
      break;
    case 'transfer_out':
    case 'fulfill':
      newAvailable -= body.quantity;
      if (newAvailable < 0) {
        return c.json({ error: 'Insufficient stock available' }, 400);
      }
      break;
    case 'adjust':
      newAvailable += body.quantity;
      if (newAvailable < 0) {
        return c.json({ error: 'Adjustment would result in negative stock' }, 400);
      }
      break;
    case 'reserve':
      if (newAvailable - newReserved < body.quantity) {
        return c.json({ error: 'Insufficient stock to reserve' }, 400);
      }
      newReserved += body.quantity;
      break;
    case 'release':
      newReserved -= body.quantity;
      if (newReserved < 0) {
        newReserved = 0;
      }
      break;
  }

  // Update or create inventory
  if (inventory) {
    await inventoryService.updateInventoryQuantities(client, inventory.id, {
      quantity_available: newAvailable,
      quantity_reserved: newReserved,
    });
  } else {
    await inventoryService.createInventory(client, {
      product_id: body.product_id,
      warehouse_id: body.warehouse_id,
      quantity_available: newAvailable,
    });
  }

  // Record the movement
  const result = await stockMovementService.createMovement(client, {
    ...body,
    correlation_id: correlationId,
  });

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, async () => {
      const existing = await stockMovementService.findExistingMovement(
        client,
        correlationId,
        body.movement_type,
        body.product_id,
        body.warehouse_id
      );
      if (existing) {
        return c.json({ ...existing, idempotent: true });
      }
      throw result.error;
    })
    .otherwise(() => {
      throw result.error;
    });
});

Deno.serve(app.fetch);
