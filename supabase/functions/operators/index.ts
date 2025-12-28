import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createOperatorSchema, updateOperatorSchema } from '../_shared/schemas.ts'
import * as operatorService from '../_shared/services/operator-service.ts'
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

// List operators
app.get('/operators', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    depotId: url.searchParams.get('depot_id') || undefined,
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    search: url.searchParams.get('search') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await operatorService.listOperators(supabase, params)
  return c.json(result)
})

// Get operator by ID
app.get('/operators/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await operatorService.getOperator(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Operator not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create operator
app.post('/operators', zodValidator(createOperatorSchema), async c => {
  const { supabase, body } = c.var

  // Validate depot exists if provided
  if (body.depot_id) {
    const depotExists = await warehouseService.warehouseExists(supabase, body.depot_id)
    if (!depotExists) {
      return c.json({ error: 'Depot not found' }, 404)
    }
  }

  const result = await operatorService.createOperator(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Operator with this employee number already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Update operator
app.put('/operators/:id', zodValidator(updateOperatorSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  // Validate depot exists if provided
  if (body.depot_id) {
    const depotExists = await warehouseService.warehouseExists(supabase, body.depot_id)
    if (!depotExists) {
      return c.json({ error: 'Depot not found' }, 404)
    }
  }

  const result = await operatorService.updateOperator(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Operator not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete operator
app.delete('/operators/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await operatorService.deleteOperator(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Operator not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
