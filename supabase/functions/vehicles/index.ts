import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createVehicleSchema, updateVehicleSchema } from '../_shared/schemas.ts'
import * as vehicleService from '../_shared/services/vehicle-service.ts'
import * as warehouseService from '../_shared/services/warehouse-service.ts'
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

// List vehicles
app.get('/vehicles', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    depotId: url.searchParams.get('depot_id') || undefined,
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await vehicleService.listVehicles(supabase, params)
  return c.json(result)
})

// Get vehicle by ID
app.get('/vehicles/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await vehicleService.getVehicle(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Vehicle not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create vehicle
app.post('/vehicles', zodValidator(createVehicleSchema), async c => {
  const { supabase, body } = c.var

  // Validate depot exists if provided
  if (body.depot_id) {
    const depotExists = await warehouseService.warehouseExists(supabase, body.depot_id)
    if (!depotExists) {
      return c.json({ error: 'Depot not found' }, 404)
    }
  }

  const result = await vehicleService.createVehicle(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Vehicle with this registration already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Update vehicle
app.put('/vehicles/:id', zodValidator(updateVehicleSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  // Validate depot exists if provided
  if (body.depot_id) {
    const depotExists = await warehouseService.warehouseExists(supabase, body.depot_id)
    if (!depotExists) {
      return c.json({ error: 'Depot not found' }, 404)
    }
  }

  const result = await vehicleService.updateVehicle(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Vehicle not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete vehicle
app.delete('/vehicles/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await vehicleService.deleteVehicle(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Vehicle not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
