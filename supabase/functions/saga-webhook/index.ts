import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { tasks } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../_shared/database.types.ts'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    warehouse_id: string
    customer_id?: string
    status: string
    total_amount: number
    notes?: string
    payment_reference?: string
    created_at: string
    updated_at: string
  }
  old_record?: Record<string, unknown>
}

const app = new Hono()

app.use('/saga-webhook/*', cors())

app.post('/saga-webhook', async c => {
  try {
    // Validate request origin - only accept requests from pg_net trigger
    const triggerSource = c.req.header('x-trigger-source')

    if (triggerSource !== 'pg_net') {
      console.warn('Unauthorized webhook request', { triggerSource })
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const payload: WebhookPayload = await c.req.json()

    // Only process INSERT events on orders table
    if (payload.type !== 'INSERT' || payload.table !== 'orders') {
      return c.json({ skipped: true, reason: 'not_order_insert' }, 200)
    }

    const order = payload.record

    // Skip if order doesn't have pending status
    if (order.status !== 'pending') {
      return c.json({ skipped: true, reason: 'not_pending' }, 200)
    }

    // Fetch order items
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey)

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`)
    }

    if (!orderItems || orderItems.length === 0) {
      return c.json({ skipped: true, reason: 'no_items' }, 200)
    }

    // Configure trigger.dev
    const triggerSecretKey = Deno.env.get('TRIGGER_SECRET_KEY')

    if (!triggerSecretKey) {
      throw new Error('Missing TRIGGER_SECRET_KEY')
    }

    const items = orderItems.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price
    }))

    // Use tasks.trigger to start the saga
    const handle = await tasks.trigger(
      'order-fulfillment-saga',
      {
        orderId: order.id,
        warehouseId: order.warehouse_id,
        items: items,
        correlationId: order.id
      },
      {
        idempotencyKey: `saga-${order.id}`
      }
    )

    console.log(`Triggered saga for order ${order.id}, run ID: ${handle.id}`)

    return c.json(
      {
        triggered: true,
        orderId: order.id,
        runId: handle.id
      },
      200
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    )
  }
})

Deno.serve(app.fetch)
