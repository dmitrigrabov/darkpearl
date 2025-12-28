import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { createWarehouseSchema, updateWarehouseSchema } from '../_shared/schemas.ts'
import { supabaseMiddleware, type SupabaseEnv } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import * as warehouseService from '../_shared/services/warehouse-service.ts'
import { match, P } from 'ts-pattern'

const app = new Hono<SupabaseEnv>()

app.use('/warehouses/*', cors())
app.use('/warehouses/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Warehouses error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

app.get('/warehouses', async c => {
  const { supabase } = c.var
  const isActive = c.req.query('is_active')
  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await warehouseService.listWarehouses(supabase, {
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    limit,
    offset
  })

  return c.json(result)
})

app.get('/warehouses/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await warehouseService.getWarehouse(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/warehouses', zodValidator(createWarehouseSchema), async c => {
  const { supabase, body } = c.var

  const result = await warehouseService.createWarehouse(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Warehouse with this code already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.put('/warehouses/:id', zodValidator(updateWarehouseSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await warehouseService.updateWarehouse(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Warehouse with this code already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.delete('/warehouses/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const hasInventory = await warehouseService.hasInventory(supabase, id)

  if (hasInventory) {
    return c.json({ error: 'Cannot delete warehouse with existing inventory' }, 409)
  }

  const result = await warehouseService.deleteWarehouse(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Warehouse deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
