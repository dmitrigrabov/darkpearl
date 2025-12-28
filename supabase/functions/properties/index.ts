import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createPropertySchema, updatePropertySchema } from '../_shared/schemas.ts'
import * as propertyService from '../_shared/services/property-service.ts'
import * as customerService from '../_shared/services/customer-service.ts'
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

// List properties
app.get('/properties', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    customerId: url.searchParams.get('customer_id') || undefined,
    postcode: url.searchParams.get('postcode') || undefined,
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await propertyService.listProperties(supabase, params)
  return c.json(result)
})

// Get property by ID
app.get('/properties/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await propertyService.getProperty(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Property not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create property
app.post('/properties', zodValidator(createPropertySchema), async c => {
  const { supabase, body } = c.var

  // Validate customer exists
  const customerExists = await customerService.customerExists(supabase, body.customer_id)
  if (!customerExists) {
    return c.json({ error: 'Customer not found' }, 404)
  }

  const result = await propertyService.createProperty(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update property
app.put('/properties/:id', zodValidator(updatePropertySchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await propertyService.updateProperty(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Property not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete property
app.delete('/properties/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await propertyService.deleteProperty(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Property not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
