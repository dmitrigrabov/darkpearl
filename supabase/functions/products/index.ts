import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateProductRequest, UpdateProductRequest } from '../_shared/types.ts';

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
  console.error('Products error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// List products
app.get('/', async (c) => {
  const client = c.get('supabase');

  const isActive = c.req.query('is_active');
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  let query = client.from('products').select('*', { count: 'exact' });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true');
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return c.json({ data, count, limit, offset });
});

// Get single product
app.get('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ error: 'Product not found' }, 404);
  }
  return c.json(data);
});

// Create product
app.post('/', async (c) => {
  const client = c.get('supabase');
  const body: CreateProductRequest = await c.req.json();

  if (!body.sku || !body.name) {
    return c.json({ error: 'sku and name are required' }, 400);
  }

  const { data, error } = await client
    .from('products')
    .insert({
      sku: body.sku,
      name: body.name,
      description: body.description,
      unit_price: body.unit_price || 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'Product with this SKU already exists' }, 409);
    }
    throw error;
  }
  return c.json(data, 201);
});

// Update product
app.put('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body: UpdateProductRequest = await c.req.json();

  const { data, error } = await client
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Product not found' }, 404);
    }
    if (error.code === '23505') {
      return c.json({ error: 'Product with this SKU already exists' }, 409);
    }
    throw error;
  }
  return c.json(data);
});

// Delete product
app.delete('/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return c.json({ message: 'Product deleted' });
});

Deno.serve(app.fetch);
