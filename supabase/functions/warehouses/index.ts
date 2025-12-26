import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '../_shared/types.ts';

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
  console.error('Warehouses error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// List warehouses
app.get('/', async (c) => {
  const client = c.get('supabase');

  const isActive = c.req.query('is_active');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = client.from('warehouses').select('*', { count: 'exact' });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true');
  }

  const { data, error, count } = await query
    .order('code', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return c.json({ data, count, limit, offset });
});

// Get single warehouse
app.get('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { data, error } = await client
    .from('warehouses')
    .select(`
      *,
      inventory:inventory(count)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Warehouse not found' }, 404);
  }
  return c.json(data);
});

// Create warehouse
app.post('/', async (c) => {
  const client = c.get('supabase');
  const body: CreateWarehouseRequest = await c.req.json();

  if (!body.code || !body.name) {
    return c.json({ error: 'code and name are required' }, 400);
  }

  const { data, error } = await client
    .from('warehouses')
    .insert({
      code: body.code,
      name: body.name,
      address: body.address,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'Warehouse with this code already exists' }, 409);
    }
    throw error;
  }
  return c.json(data, 201);
});

// Update warehouse
app.put('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body: UpdateWarehouseRequest = await c.req.json();

  const { data, error } = await client
    .from('warehouses')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Warehouse not found' }, 404);
    }
    if (error.code === '23505') {
      return c.json({ error: 'Warehouse with this code already exists' }, 409);
    }
    throw error;
  }
  return c.json(data);
});

// Delete warehouse
app.delete('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  // Check if warehouse has inventory
  const { count } = await client
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('warehouse_id', id);

  if (count && count > 0) {
    return c.json({ error: 'Cannot delete warehouse with existing inventory' }, 409);
  }

  const { error } = await client
    .from('warehouses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return c.json({ message: 'Warehouse deleted' });
});

Deno.serve(app.fetch);
