import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createLawnSchema, updateLawnSchema } from '../_shared/schemas.ts'
import * as lawnService from '../_shared/services/lawn-service.ts'
import * as propertyService from '../_shared/services/property-service.ts'
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

// List lawns
app.get('/lawns', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    propertyId: url.searchParams.get('property_id') || undefined,
    customerId: url.searchParams.get('customer_id') || undefined,
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await lawnService.listLawns(supabase, params)
  return c.json(result)
})

// Get lawn by ID
app.get('/lawns/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await lawnService.getLawn(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Lawn not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create lawn
app.post('/lawns', zodValidator(createLawnSchema), async c => {
  const { supabase, body } = c.var

  // Validate property exists
  const propertyExists = await propertyService.propertyExists(supabase, body.property_id)
  if (!propertyExists) {
    return c.json({ error: 'Property not found' }, 404)
  }

  const result = await lawnService.createLawn(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update lawn
app.put('/lawns/:id', zodValidator(updateLawnSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await lawnService.updateLawn(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Lawn not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete lawn
app.delete('/lawns/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await lawnService.deleteLawn(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Lawn not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
