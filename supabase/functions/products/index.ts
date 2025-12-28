import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { createProductSchema, updateProductSchema } from '../_shared/schemas.ts'
import { supabaseMiddleware, type SupabaseEnv } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import * as productService from '../_shared/services/product-service.ts'
import { match, P } from 'ts-pattern'

const app = new Hono<SupabaseEnv>()

app.use('/*', cors())
app.use('/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Products error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

app.get('/products', async c => {
  const { supabase } = c.var

  const isActive = c.req.query('is_active')
  const search = c.req.query('search')

  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await productService.listProducts(supabase, {
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search,
    limit,
    offset
  })

  return c.json(result)
})

app.get('/products/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await productService.getProduct(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Product not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/products', zodValidator(createProductSchema), async c => {
  const { supabase, body } = c.var

  const result = await productService.createProduct(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Product with this SKU already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.put('/products/:id', zodValidator(updateProductSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await productService.updateProduct(supabase, id, body)

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
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await productService.deleteProduct(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Product deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Product not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
