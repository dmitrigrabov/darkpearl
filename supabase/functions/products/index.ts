import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import type { CreateProductRequest, UpdateProductRequest } from '../_shared/types.ts';
import * as productService from '../_shared/services/product-service.ts';
import { match } from 'ts-pattern';

type Variables = {
  supabase: ReturnType<typeof createSupabaseClient>;
};

const app = new Hono<{ Variables: Variables }>()

app.use('/*', cors());

app.use('/*', async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw));
  await next();
});

app.onError((err, c) => {
  console.error('Products error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/products', async (c) => {
  const client = c.get('supabase');
  const isActive = c.req.query('is_active');
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  const result = await productService.listProducts(client, {
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search,
    limit,
    offset,
  });

  return c.json(result);
});

app.get('/products/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const product = await productService.getProduct(client, id);
  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }
  return c.json(product);
});

app.post('/products', async (c) => {
  const client = c.get('supabase');
  const body: CreateProductRequest = await c.req.json();

  if (!body.sku || !body.name) {
    return c.json({ error: 'sku and name are required' }, 400);
  }

  try {
    const product = await productService.createProduct(client, body);
    return c.json(product, 201);
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === '23505') {
      return c.json({ error: 'Product with this SKU already exists' }, 409);
    }
    throw err;
  }
});

app.put('/products/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body: UpdateProductRequest = await c.req.json();


    const {data, error} = await productService.updateProduct(client, id, body);
if (error) {
  return match(error)
    .with({ code: 'PGRST116' }, () => c.json({ error: 'Product not found' }, 404))
    .with({ code: '23505' }, () => c.json({ error: 'Product with this SKU already exists' }, 409))
    .otherwise(() => {
      throw error;
    });   
}
return c.json(data);

});

app.delete('/products/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  await productService.deleteProduct(client, id);
  return c.json({ message: 'Product deleted' });
});

Deno.serve(app.fetch);
