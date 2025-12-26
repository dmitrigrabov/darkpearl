import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createSupabaseClient } from '../_shared/supabase-client.ts'
import type { CreateProductRequest } from '../_shared/types.ts'
import { updateProductSchema } from '../_shared/schemas.ts'
import * as productService from '../_shared/services/product-service.ts'
import { match, P } from 'ts-pattern'

type Variables = {
  supabase: ReturnType<typeof createSupabaseClient>
}

const app = new Hono<{ Variables: Variables }>()

app.use('/*', cors())

app.use('/*', async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw))
  await next()
})

app.onError((err, c) => {
  console.error('Products error:', err)
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

app.get('/products', async c => {
  const client = c.get('supabase')
  const isActive = c.req.query('is_active')
  const search = c.req.query('search')
  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await productService.listProducts(client, {
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search,
    limit,
    offset
  })

  return c.json(result)
})

app.get('/products/:id', async c => {
  const client = c.get('supabase')
  const id = c.req.param('id')

  const result = await productService.getProduct(client, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Product not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/products', async c => {
  const client = c.get('supabase')
  const body: CreateProductRequest = await c.req.json()

  if (!body.sku || !body.name) {
    return c.json({ error: 'sku and name are required' }, 400)
  }

  const result = await productService.createProduct(client, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Product with this SKU already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.put('/products/:id', async c => {
  const client = c.get('supabase')
  const id = c.req.param('id')

  const bodyJson = await c.req.json()
  const body = updateProductSchema.parse(bodyJson)

  const result = await productService.updateProduct(client, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Product not found' }, 404))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Product with this SKU already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.delete('/products/:id', async c => {
  const client = c.get('supabase')
  const id = c.req.param('id')

  const result = await productService.deleteProduct(client, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Product deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Product not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
