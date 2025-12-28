import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import type { MovementType } from '../_shared/types.ts'
import { createStockMovementSchema } from '../_shared/schemas.ts'
import { supabaseMiddleware, type SupabaseEnv } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import * as stockMovementService from '../_shared/services/stock-movement-service.ts'
import * as inventoryService from '../_shared/services/inventory-service.ts'
import { match, P } from 'ts-pattern'

const app = new Hono<SupabaseEnv>()

app.use('/stock-movements/*', cors())
app.use('/stock-movements/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Stock movements error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

app.get('/stock-movements', async c => {
  const client = c.var.supabase
  const productId = c.req.query('product_id')
  const warehouseId = c.req.query('warehouse_id')
  const movementType = c.req.query('movement_type') as MovementType | undefined
  const referenceId = c.req.query('reference_id')
  const correlationId = c.req.query('correlation_id')

  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await stockMovementService.listMovements(client, {
    productId,
    warehouseId,
    movementType,
    referenceId,
    correlationId,
    limit,
    offset
  })

  return c.json(result)
})

app.get('/stock-movements/:id', async c => {
  const client = c.var.supabase
  const id = c.req.param('id')

  const result = await stockMovementService.getMovement(client, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Stock movement not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

app.post('/stock-movements', zodValidator(createStockMovementSchema), async c => {
  const { supabase, body } = c.var

  // Get current inventory
  const inventory = await inventoryService.getInventoryByProductWarehouse(
    supabase,
    body.product_id,
    body.warehouse_id
  )

  const correlationId = body.correlation_id || crypto.randomUUID()

  const currentAvailable = inventory?.quantity_available || 0
  const currentReserved = inventory?.quantity_reserved || 0

  const quantityUpdate = match(body.movement_type)
    .with(P.union('receive', 'transfer_in'), () => ({
      available: currentAvailable + body.quantity,
      reserved: currentReserved
    }))
    .with(P.union('transfer_out', 'fulfill'), () => {
      const updated = currentAvailable - body.quantity
      if (updated < 0) {
        return { error: 'Insufficient stock available' as const }
      }
      return { available: updated, reserved: currentReserved }
    })
    .with('adjust', () => {
      const updated = currentAvailable + body.quantity
      if (updated < 0) {
        return { error: 'Adjustment would result in negative stock' as const }
      }
      return { available: updated, reserved: currentReserved }
    })
    .with('reserve', () => {
      if (currentAvailable - currentReserved < body.quantity) {
        return { error: 'Insufficient stock to reserve' as const }
      }
      return { available: currentAvailable, reserved: currentReserved + body.quantity }
    })
    .with('release', () => ({
      available: currentAvailable,
      reserved: Math.max(0, currentReserved - body.quantity)
    }))
    .exhaustive()

  if ('error' in quantityUpdate) {
    return c.json({ error: quantityUpdate.error }, 400)
  }

  const { available: newAvailable, reserved: newReserved } = quantityUpdate

  // Update or create inventory
  if (inventory) {
    await inventoryService.updateInventoryQuantities(supabase, inventory.id, {
      quantity_available: newAvailable,
      quantity_reserved: newReserved
    })
  } else {
    await inventoryService.createInventory(supabase, {
      product_id: body.product_id,
      warehouse_id: body.warehouse_id,
      quantity_available: newAvailable
    })
  }

  // Record the movement
  const result = await stockMovementService.createMovement(supabase, {
    ...body,
    correlation_id: correlationId
  })

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, async () => {
      const existing = await stockMovementService.findExistingMovement(
        supabase,
        correlationId,
        body.movement_type,
        body.product_id,
        body.warehouse_id
      )
      if (existing) {
        return c.json({ ...existing, idempotent: true })
      }
      throw result.error
    })
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
