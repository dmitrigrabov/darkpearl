import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createTreatmentSchema, updateTreatmentSchema, addTreatmentProductSchema } from '../_shared/schemas.ts'
import * as treatmentService from '../_shared/services/treatment-service.ts'
import * as productService from '../_shared/services/product-service.ts'
import type { SupabaseEnv } from '../_shared/types.ts'

const app = new Hono<SupabaseEnv>()

app.use('/*', cors())
app.use('/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

// List treatments
app.get('/treatments', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    season: url.searchParams.get('season') || undefined,
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await treatmentService.listTreatments(supabase, params)
  return c.json(result)
})

// Get treatment by ID
app.get('/treatments/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await treatmentService.getTreatment(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create treatment
app.post('/treatments', zodValidator(createTreatmentSchema), async c => {
  const { supabase, body } = c.var

  const result = await treatmentService.createTreatment(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Treatment with this code already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Update treatment
app.put('/treatments/:id', zodValidator(updateTreatmentSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await treatmentService.updateTreatment(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete treatment
app.delete('/treatments/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await treatmentService.deleteTreatment(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Add product to treatment
app.post('/treatments/:id/products', zodValidator(addTreatmentProductSchema), async c => {
  const { supabase, body } = c.var
  const treatmentId = c.req.param('id')

  // Validate treatment exists
  const treatmentExists = await treatmentService.treatmentExists(supabase, treatmentId)
  if (!treatmentExists) {
    return c.json({ error: 'Treatment not found' }, 404)
  }

  // Validate product exists
  const productExists = await productService.productExists(supabase, body.product_id)
  if (!productExists) {
    return c.json({ error: 'Product not found' }, 404)
  }

  const result = await treatmentService.addTreatmentProduct(supabase, treatmentId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Product already added to this treatment' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Remove product from treatment
app.delete('/treatments/:id/products/:productId', async c => {
  const { supabase } = c.var
  const treatmentId = c.req.param('id')
  const productId = c.req.param('productId')

  const result = await treatmentService.removeTreatmentProduct(supabase, treatmentId, productId)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Treatment product not found' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
