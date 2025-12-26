import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import type { CreateOrderRequest, OrderStatus } from '../_shared/types.ts';
import * as orderService from '../_shared/services/order-service.ts';
import * as sagaService from '../_shared/services/saga-service.ts';
import * as outboxService from '../_shared/services/outbox-service.ts';
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

  // Create order items
  const items = await orderService.createOrderItems(client, order.id, body.items);

  // Add event to outbox to start the saga (needs service role)
  const sagaPayload = {
    saga_type: 'order_fulfillment',
    order_id: order.id,
    warehouse_id: body.warehouse_id,
    items: body.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };

  try {
    await outboxService.addOutboxEvent(
      serviceClient,
      'saga_start',
      'order',
      order.id,
      sagaPayload
    );
  } catch (e) {
    console.error('Failed to add outbox event:', e);
    // Order is still created, saga will need manual trigger
  }

  // Trigger saga worker immediately
  try {
    const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saga-worker`;
    await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'immediate' }),
    });
  } catch (e) {
    console.error('Failed to trigger saga worker:', e);
  }

  return c.json(
    {
      ...order,
      items,
      message: 'Order created, fulfillment saga started',
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
      const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saga-orchestrator`;
      await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saga_id: saga.id, action: 'compensate' }),
      });
    } catch (e) {
      console.error('Failed to trigger compensation:', e);
    }
  }

  return c.json({ message: 'Order cancelled' });
});

Deno.serve(app.fetch);
