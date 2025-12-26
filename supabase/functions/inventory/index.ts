import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateInventoryRequest, UpdateInventoryRequest } from '../_shared/types.ts';

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
  console.error('Inventory error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// List inventory
app.get('/', async (c) => {
  const client = c.get('supabase');

  const productId = c.req.query('product_id');
  const warehouseId = c.req.query('warehouse_id');
  const lowStock = c.req.query('low_stock');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = client.from('inventory').select(
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
  if (lowStock === 'true') {
    query = query.lte('quantity_available', 'reorder_point');
  }

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return c.json({ data, count, limit, offset });
});

// Get single inventory
app.get('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { data, error } = await client
    .from('inventory')
    .select(`
      *,
      product:products(id, sku, name),
      warehouse:warehouses(id, code, name)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Inventory not found' }, 404);
  }
  return c.json(data);
});

// Create inventory
app.post('/', async (c) => {
  const client = c.get('supabase');
  const body: CreateInventoryRequest = await c.req.json();

  if (!body.product_id || !body.warehouse_id) {
    return c.json({ error: 'product_id and warehouse_id are required' }, 400);
  }

  // Check if product exists
  const { data: product } = await client
    .from('products')
    .select('id')
    .eq('id', body.product_id)
    .single();

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  // Check if warehouse exists
  const { data: warehouse } = await client
    .from('warehouses')
    .select('id')
    .eq('id', body.warehouse_id)
    .single();

  if (!warehouse) {
    return c.json({ error: 'Warehouse not found' }, 404);
  }

  const { data, error } = await client
    .from('inventory')
    .insert({
      product_id: body.product_id,
      warehouse_id: body.warehouse_id,
      quantity_available: body.quantity_available || 0,
      quantity_reserved: 0,
      reorder_point: body.reorder_point || 10,
      reorder_quantity: body.reorder_quantity || 50,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'Inventory already exists for this product-warehouse combination' }, 409);
    }
    throw error;
  }
  return c.json(data, 201);
});

// Update inventory
app.put('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body: UpdateInventoryRequest = await c.req.json();

  if (body.quantity_available !== undefined && body.quantity_available < 0) {
    return c.json({ error: 'quantity_available cannot be negative' }, 400);
  }
  if (body.quantity_reserved !== undefined && body.quantity_reserved < 0) {
    return c.json({ error: 'quantity_reserved cannot be negative' }, 400);
  }

  const { data, error } = await client
    .from('inventory')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Inventory not found' }, 404);
    }
    throw error;
  }
  return c.json(data);
});

// Delete inventory
app.delete('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { error } = await client
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return c.json({ message: 'Inventory deleted' });
});

Deno.serve(app.fetch);
