import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../_shared/database.types.ts'
import {
  CreateInventorySchema,
  UpdateInventorySchema,
  type CreateInventoryInput,
  type UpdateInventoryInput
} from '../_shared/schemas.ts'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, getValidatedBody, formatZodError } from '../_shared/validation.ts'
import * as inventoryService from '../_shared/services/inventory-service.ts'
import * as productService from '../_shared/services/product-service.ts'
import * as warehouseService from '../_shared/services/warehouse-service.ts'
import { match, P } from 'ts-pattern'

type Env = {
  Variables: {
    supabase: SupabaseClient<Database>
  }
}

const app = new Hono<Env>()

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
  const client = c.get('supabase')
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
  const client = c.get('supabase')
  const id = c.req.param('id')

  const result = await inventoryService.getInventory(client, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/inventory', zodValidator(CreateInventorySchema), async c => {
  const client = c.get('supabase')
  const body = getValidatedBody<CreateInventoryInput>(c)

  const productExists = await productService.productExists(client, body.product_id)
  if (!productExists) {
    return c.json({ error: 'Product not found' }, 404)
  }

  const warehouseExists = await warehouseService.warehouseExists(client, body.warehouse_id)
  if (!warehouseExists) {
    return c.json({ error: 'Warehouse not found' }, 404)
  }

  const result = await inventoryService.createInventory(client, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Inventory already exists for this product-warehouse combination' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

app.put('/inventory/:id', zodValidator(UpdateInventorySchema), async c => {
  const client = c.get('supabase')
  const id = c.req.param('id')
  const body = getValidatedBody<UpdateInventoryInput>(c)

  const result = await inventoryService.updateInventory(client, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.delete('/inventory/:id', async c => {
  const client = c.get('supabase')
  const id = c.req.param('id')

  const result = await inventoryService.deleteInventory(client, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Inventory deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Inventory not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
