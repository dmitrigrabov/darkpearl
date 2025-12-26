import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { tasks } from '@trigger.dev/sdk/v3';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import type { CreateOrderRequest, OrderStatus } from '../_shared/types.ts';
import * as orderService from '../_shared/services/order-service.ts';
import * as sagaService from '../_shared/services/saga-service.ts';
import * as inventoryService from '../_shared/services/inventory-service.ts';

type Variables = {
  supabase: ReturnType<typeof createSupabaseClient>;
  serviceClient: ReturnType<typeof createServiceClient>;
};

const app = new Hono<{ Variables: Variables }>();

app.use('/orders/*', cors());

app.use('/orders/*', async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw));
  c.set('serviceClient', createServiceClient());
  await next();
});

app.onError((err, c) => {
  console.error('Orders error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/orders', async (c) => {
  const client = c.get('supabase');
  const status = c.req.query('status') as OrderStatus | undefined;
  const customerId = c.req.query('customer_id');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  const result = await orderService.listOrders(client, {
    status,
    customerId,
    limit,
    offset,
  });

  return c.json(result);
});

app.get('/orders/:id', async (c) => {
  const client = c.get('supabase');
  const serviceClient = c.get('serviceClient');
  const id = c.req.param('id');

  const order = await orderService.getOrder(client, id);
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // Get saga status (needs service role)
  const saga = await sagaService.getSagaStatus(serviceClient, id);

  return c.json({ ...order, saga: saga || null });
});

app.post('/orders', async (c) => {
  const client = c.get('supabase');
  const serviceClient = c.get('serviceClient');
  const body: CreateOrderRequest = await c.req.json();

  if (!body.warehouse_id || !body.items || body.items.length === 0) {
    return c.json({ error: 'warehouse_id and at least one item are required' }, 400);
  }

  // Validate warehouse exists
  const warehouseExists = await inventoryService.warehouseExists(client, body.warehouse_id);
  if (!warehouseExists) {
    return c.json({ error: 'Warehouse not found' }, 404);
  }

  // Validate all products exist and calculate total
  let totalAmount = 0;
  for (const item of body.items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return c.json({ error: 'Each item must have product_id and positive quantity' }, 400);
    }

    const productPrice = await orderService.getProductPrice(client, item.product_id);
    if (productPrice === null) {
      return c.json({ error: `Product ${item.product_id} not found` }, 404);
    }

    const unitPrice = item.unit_price ?? productPrice;
    totalAmount += unitPrice * item.quantity;
  }

  // Create order
  const order = await orderService.createOrder(client, {
    customer_id: body.customer_id,
    warehouse_id: body.warehouse_id,
    total_amount: totalAmount,
    notes: body.notes,
  });

  // Create order items (with unit_price ensured for each item)
  const itemsWithPrices = await Promise.all(
    body.items.map(async (item) => {
      const productPrice = await orderService.getProductPrice(client, item.product_id);
      return {
        ...item,
        unit_price: item.unit_price ?? productPrice ?? 0,
      };
    })
  );
  const items = await orderService.createOrderItems(client, order.id, itemsWithPrices);

  // Note: Saga is automatically triggered via PostgreSQL trigger (pg_net -> saga-webhook)
  // The trigger fires on INSERT to orders table and calls the saga-webhook Edge Function

  return c.json(
    {
      ...order,
      items,
      message: 'Order created, fulfillment saga will be triggered automatically',
    },
    201
  );
});

app.delete('/orders/:id', async (c) => {
  const client = c.get('supabase');
  const serviceClient = c.get('serviceClient');
  const id = c.req.param('id');

  // Get current order status
  const status = await orderService.getOrderStatus(client, id);
  if (!status) {
    return c.json({ error: 'Order not found' }, 404);
  }

  // Can only cancel pending orders
  if (!['pending', 'reserved', 'payment_failed'].includes(status)) {
    return c.json({ error: `Cannot cancel order in ${status} status` }, 409);
  }

  // Update order status
  await orderService.updateOrderStatus(client, id, 'cancelled');

  // Get the saga and trigger compensation if needed (needs service role)
  const saga = await sagaService.getSagaByCorrelationId(serviceClient, id);

  if (saga && saga.status !== 'completed' && saga.status !== 'failed') {
    try {
      // Trigger compensation via trigger.dev
      const payload = saga.payload as Record<string, unknown> | null;
      await tasks.trigger('compensate-order-saga', {
        correlationId: id,
        orderId: id,
        warehouseId: payload?.warehouse_id as string,
        items: (payload?.items as Array<{ product_id: string; quantity: number; unit_price: number }>) || [],
        triggerRunId: 'manual-cancellation',
      });
    } catch (e) {
      console.error('Failed to trigger compensation:', e);
    }
  }

  return c.json({ message: 'Order cancelled' });
});

Deno.serve(app.fetch);
