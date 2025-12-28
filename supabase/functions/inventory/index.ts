import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { createInventorySchema, updateInventorySchema } from '../_shared/schemas.ts'
import { supabaseMiddleware, type SupabaseEnv } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import * as inventoryService from '../_shared/services/inventory-service.ts'
import * as productService from '../_shared/services/product-service.ts'
import * as warehouseService from '../_shared/services/warehouse-service.ts'
import { match, P } from 'ts-pattern'

const app = new Hono<SupabaseEnv>()

app.use('/inventory/*', cors())
app.use('/inventory/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Inventory error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

app.get('/inventory', async c => {
  const client = c.var.supabase
  const productId = c.req.query('product_id')
  const warehouseId = c.req.query('warehouse_id')
  const lowStock = c.req.query('low_stock')
  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await inventoryService.listInventory(client, {
    productId,
    warehouseId,
    lowStock: lowStock === 'true',
    limit,
    offset
  })

  return c.json(result)
})

app.get('/inventory/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await inventoryService.getInventory(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/inventory', zodValidator(createInventorySchema), async c => {
  const { supabase, body } = c.var

  const productExists = await productService.productExists(supabase, body.product_id)
  if (!productExists) {
    return c.json({ error: 'Product not found' }, 404)
  }

  const warehouseExists = await warehouseService.warehouseExists(supabase, body.warehouse_id)
  if (!warehouseExists) {
    return c.json({ error: 'Warehouse not found' }, 404)
  }

  const result = await inventoryService.createInventory(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Inventory already exists for this product-warehouse combination' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.put('/inventory/:id', zodValidator(updateInventorySchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await inventoryService.updateInventory(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.delete('/inventory/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await inventoryService.deleteInventory(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Inventory deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
