import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import {
  createTreatmentPlanSchema,
  updateTreatmentPlanSchema,
  addTreatmentPlanItemSchema,
  updateTreatmentPlanItemSchema
} from '../_shared/schemas.ts'
import * as treatmentPlanService from '../_shared/services/treatment-plan-service.ts'
import * as lawnService from '../_shared/services/lawn-service.ts'
import * as treatmentService from '../_shared/services/treatment-service.ts'
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

// List treatment plans
app.get('/treatment-plans', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const statusParam = url.searchParams.get('status')
  const validStatuses = ['active', 'paused', 'completed', 'cancelled'] as const
  const status = statusParam && validStatuses.includes(statusParam as typeof validStatuses[number])
    ? statusParam as typeof validStatuses[number]
    : undefined

  const params = {
    lawnId: url.searchParams.get('lawn_id') || undefined,
    customerId: url.searchParams.get('customer_id') || undefined,
    year: url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined,
    status,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await treatmentPlanService.listTreatmentPlans(supabase, params)
  return c.json(result)
})

// Get treatment plan by ID
app.get('/treatment-plans/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await treatmentPlanService.getTreatmentPlan(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment plan not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create treatment plan
app.post('/treatment-plans', zodValidator(createTreatmentPlanSchema), async c => {
  const { supabase, body } = c.var

  // Validate lawn exists
  const lawnExists = await lawnService.lawnExists(supabase, body.lawn_id)
  if (!lawnExists) {
    return c.json({ error: 'Lawn not found' }, 404)
  }

  const result = await treatmentPlanService.createTreatmentPlan(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Treatment plan for this lawn and year already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Update treatment plan
app.put('/treatment-plans/:id', zodValidator(updateTreatmentPlanSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await treatmentPlanService.updateTreatmentPlan(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment plan not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete treatment plan
app.delete('/treatment-plans/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await treatmentPlanService.deleteTreatmentPlan(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Treatment plan not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Add item to treatment plan
app.post('/treatment-plans/:id/items', zodValidator(addTreatmentPlanItemSchema), async c => {
  const { supabase, body } = c.var
  const planId = c.req.param('id')

  // Validate treatment plan exists
  const planExists = await treatmentPlanService.treatmentPlanExists(supabase, planId)
  if (!planExists) {
    return c.json({ error: 'Treatment plan not found' }, 404)
  }

  // Validate treatment exists
  const treatmentExists = await treatmentService.treatmentExists(supabase, body.treatment_id)
  if (!treatmentExists) {
    return c.json({ error: 'Treatment not found' }, 404)
  }

  const result = await treatmentPlanService.addTreatmentPlanItem(supabase, planId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update treatment plan item
app.put('/treatment-plans/:id/items/:itemId', zodValidator(updateTreatmentPlanItemSchema), async c => {
  const { supabase, body } = c.var
  const planId = c.req.param('id')
  const itemId = c.req.param('itemId')

  const result = await treatmentPlanService.updateTreatmentPlanItem(supabase, planId, itemId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Treatment plan item not found' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Remove item from treatment plan
app.delete('/treatment-plans/:id/items/:itemId', async c => {
  const { supabase } = c.var
  const planId = c.req.param('id')
  const itemId = c.req.param('itemId')

  const result = await treatmentPlanService.removeTreatmentPlanItem(supabase, planId, itemId)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Treatment plan item not found' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
