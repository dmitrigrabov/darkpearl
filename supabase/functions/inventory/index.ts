import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateInventoryRequest, UpdateInventoryRequest } from '../_shared/types.ts';
import * as inventoryService from '../_shared/services/inventory-service.ts';
import * as productService from '../_shared/services/product-service.ts';
import * as warehouseService from '../_shared/services/warehouse-service.ts';

type Variables = {
  supabase: ReturnType<typeof createSupabaseClient>;
};

const app = new Hono<{ Variables: Variables }>();

app.use('/inventory/*', cors());

app.use('/inventory/*', async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw));
  await next();
});

app.onError((err, c) => {
  console.error('Inventory error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/inventory', async (c) => {
  const client = c.get('supabase');
  const productId = c.req.query('product_id');
  const warehouseId = c.req.query('warehouse_id');
  const lowStock = c.req.query('low_stock');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  const result = await inventoryService.listInventory(client, {
    productId,
    warehouseId,
    lowStock: lowStock === 'true',
    limit,
    offset,
  });

  return c.json(result);
});

app.get('/inventory/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const inventory = await inventoryService.getInventory(client, id);
  if (!inventory) {
    return c.json({ error: 'Inventory not found' }, 404);
  }
  return c.json(inventory);
});

app.post('/inventory', async (c) => {
  const client = c.get('supabase');
  const body: CreateInventoryRequest = await c.req.json();

  if (!body.product_id || !body.warehouse_id) {
    return c.json({ error: 'product_id and warehouse_id are required' }, 400);
  }

  const productExists = await productService.productExists(client, body.product_id);
  if (!productExists) {
    return c.json({ error: 'Product not found' }, 404);
  }

  const warehouseExists = await warehouseService.warehouseExists(client, body.warehouse_id);
  if (!warehouseExists) {
    return c.json({ error: 'Warehouse not found' }, 404);
  }

  try {
    const inventory = await inventoryService.createInventory(client, body);
    return c.json(inventory, 201);
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === '23505') {
      return c.json({ error: 'Inventory already exists for this product-warehouse combination' }, 409);
    }
    throw err;
  }
});

app.put('/inventory/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body: UpdateInventoryRequest = await c.req.json();

  if (body.quantity_available !== undefined && body.quantity_available < 0) {
    return c.json({ error: 'quantity_available cannot be negative' }, 400);
  }
  if (body.quantity_reserved !== undefined && body.quantity_reserved < 0) {
    return c.json({ error: 'quantity_reserved cannot be negative' }, 400);
  }

  const inventory = await inventoryService.updateInventory(client, id, body);
  if (!inventory) {
    return c.json({ error: 'Inventory not found' }, 404);
  }
  return c.json(inventory);
});

app.delete('/inventory/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  await inventoryService.deleteInventory(client, id);
  return c.json({ message: 'Inventory deleted' });
});

Deno.serve(app.fetch);
