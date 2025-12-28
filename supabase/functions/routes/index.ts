import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import {
  createRouteSchema,
  updateRouteSchema,
  addRouteStopSchema,
  updateRouteStopSchema
} from '../_shared/schemas.ts'
import * as routeService from '../_shared/services/route-service.ts'
import * as operatorService from '../_shared/services/operator-service.ts'
import * as warehouseService from '../_shared/services/warehouse-service.ts'
import * as vehicleService from '../_shared/services/vehicle-service.ts'
import * as lawnService from '../_shared/services/lawn-service.ts'
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

// List routes
app.get('/routes', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const statusParam = url.searchParams.get('status')
  const validStatuses = ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const
  const status = statusParam && validStatuses.includes(statusParam as typeof validStatuses[number])
    ? statusParam as typeof validStatuses[number]
    : undefined

  const params = {
    operatorId: url.searchParams.get('operator_id') || undefined,
    depotId: url.searchParams.get('depot_id') || undefined,
    routeDate: url.searchParams.get('route_date') || undefined,
    dateFrom: url.searchParams.get('date_from') || undefined,
    dateTo: url.searchParams.get('date_to') || undefined,
    status,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await routeService.listRoutes(supabase, params)
  return c.json(result)
})

// Get route by ID
app.get('/routes/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await routeService.getRoute(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Route not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create route
app.post('/routes', zodValidator(createRouteSchema), async c => {
  const { supabase, body } = c.var

  // Validate operator exists
  const operatorExists = await operatorService.operatorExists(supabase, body.operator_id)
  if (!operatorExists) {
    return c.json({ error: 'Operator not found' }, 404)
  }

  // Validate depot exists
  const depotExists = await warehouseService.warehouseExists(supabase, body.depot_id)
  if (!depotExists) {
    return c.json({ error: 'Depot not found' }, 404)
  }

  // Validate vehicle exists if provided
  if (body.vehicle_id) {
    const vehicleExists = await vehicleService.vehicleExists(supabase, body.vehicle_id)
    if (!vehicleExists) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
  }

  const result = await routeService.createRoute(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update route
app.put('/routes/:id', zodValidator(updateRouteSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await routeService.updateRoute(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Route not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete route
app.delete('/routes/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await routeService.deleteRoute(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Route not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Add stop to route
app.post('/routes/:id/stops', zodValidator(addRouteStopSchema), async c => {
  const { supabase, body } = c.var
  const routeId = c.req.param('id')

  // Validate route exists
  const routeExists = await routeService.routeExists(supabase, routeId)
  if (!routeExists) {
    return c.json({ error: 'Route not found' }, 404)
  }

  // Validate lawn exists
  const lawnExists = await lawnService.lawnExists(supabase, body.lawn_id)
  if (!lawnExists) {
    return c.json({ error: 'Lawn not found' }, 404)
  }

  const result = await routeService.addRouteStop(supabase, routeId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update route stop
app.put('/routes/:id/stops/:stopId', zodValidator(updateRouteStopSchema), async c => {
  const { supabase, body } = c.var
  const routeId = c.req.param('id')
  const stopId = c.req.param('stopId')

  const result = await routeService.updateRouteStop(supabase, routeId, stopId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Route stop not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Remove stop from route
app.delete('/routes/:id/stops/:stopId', async c => {
  const { supabase } = c.var
  const routeId = c.req.param('id')
  const stopId = c.req.param('stopId')

  const result = await routeService.removeRouteStop(supabase, routeId, stopId)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Route stop not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Start route
app.post('/routes/:id/start', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await routeService.startRoute(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Route not found or not in confirmed status' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Complete route
app.post('/routes/:id/complete', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  let actualDurationMinutes: number | undefined
  let actualDistanceMiles: number | undefined

  try {
    const body = await c.req.json()
    actualDurationMinutes = body.actual_duration_minutes
    actualDistanceMiles = body.actual_distance_miles
  } catch {
    // Body is optional
  }

  const result = await routeService.completeRoute(supabase, id, actualDurationMinutes, actualDistanceMiles)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Route not found or not in progress' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
