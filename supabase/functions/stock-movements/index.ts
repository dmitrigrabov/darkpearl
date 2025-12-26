import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateStockMovementRequest, MovementType } from '../_shared/types.ts';

const VALID_MOVEMENT_TYPES: MovementType[] = [
  'receive',
  'transfer_out',
  'transfer_in',
  'adjust',
  'reserve',
  'release',
  'fulfill',
];

type Variables = {
  supabase: ReturnType<typeof createSupabaseClient>;
};

const app = new Hono<{ Variables: Variables }>();

app.use('/*', cors());

// Supabase client middleware
app.use('/*', async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw));
  await next();
});

app.onError((err, c) => {
  console.error('Stock movements error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// List movements
app.get('/', async (c) => {
  const client = c.get('supabase');

  const productId = c.req.query('product_id');
  const warehouseId = c.req.query('warehouse_id');
  const movementType = c.req.query('movement_type');
  const referenceId = c.req.query('reference_id');
  const correlationId = c.req.query('correlation_id');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = client.from('stock_movements').select(
    `
      *,
      product:products(id, sku, name),
      warehouse:warehouses(id, code, name)
    `,
    { count: 'exact' }
  );

  if (productId) {
    query = query.eq('product_id', productId);
  }
  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }
  if (movementType) {
    query = query.eq('movement_type', movementType);
  }
  if (referenceId) {
    query = query.eq('reference_id', referenceId);
  }
  if (correlationId) {
    query = query.eq('correlation_id', correlationId);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return c.json({ data, count, limit, offset });
});

// Get single movement
app.get('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { data, error } = await client
    .from('stock_movements')
    .select(`
      *,
      product:products(id, sku, name),
      warehouse:warehouses(id, code, name)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Stock movement not found' }, 404);
  }
  return c.json(data);
});

// Create movement
app.post('/', async (c) => {
  const client = c.get('supabase');
  const body: CreateStockMovementRequest = await c.req.json();

  if (!body.product_id || !body.warehouse_id || !body.movement_type || body.quantity === undefined) {
    return c.json({ error: 'product_id, warehouse_id, movement_type, and quantity are required' }, 400);
  }

  if (!VALID_MOVEMENT_TYPES.includes(body.movement_type)) {
    return c.json({ error: `Invalid movement_type. Must be one of: ${VALID_MOVEMENT_TYPES.join(', ')}` }, 400);
  }

  // Get current inventory
  const { data: inventory } = await client
    .from('inventory')
    .select('*')
    .eq('product_id', body.product_id)
    .eq('warehouse_id', body.warehouse_id)
    .single();

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
    const { error: updateError } = await client
      .from('inventory')
      .update({
        quantity_available: newAvailable,
        quantity_reserved: newReserved,
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await client
      .from('inventory')
      .insert({
        product_id: body.product_id,
        warehouse_id: body.warehouse_id,
        quantity_available: newAvailable,
        quantity_reserved: newReserved,
      });

    if (insertError) throw insertError;
  }

  // Record the movement
  const { data: movement, error: movementError } = await client
    .from('stock_movements')
    .insert({
      correlation_id: correlationId,
      product_id: body.product_id,
      warehouse_id: body.warehouse_id,
      movement_type: body.movement_type,
      quantity: body.quantity,
      reference_id: body.reference_id,
      reference_type: body.reference_type,
      notes: body.notes,
    })
    .select()
    .single();

  if (movementError) {
    if (movementError.code === '23505') {
      const { data: existing } = await client
        .from('stock_movements')
        .select('*')
        .eq('correlation_id', correlationId)
        .eq('movement_type', body.movement_type)
        .eq('product_id', body.product_id)
        .eq('warehouse_id', body.warehouse_id)
        .single();

      if (existing) {
        return c.json({ ...existing, idempotent: true });
      }
    }
    throw movementError;
  }

  return c.json(movement, 201);
});

Deno.serve(app.fetch);
