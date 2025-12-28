import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import {
  createJobSchema,
  updateJobSchema,
  addJobTreatmentSchema,
  addJobConsumptionSchema
} from '../_shared/schemas.ts'
import * as jobService from '../_shared/services/job-service.ts'
import * as lawnService from '../_shared/services/lawn-service.ts'
import * as treatmentService from '../_shared/services/treatment-service.ts'
import * as productService from '../_shared/services/product-service.ts'
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

// List jobs
app.get('/jobs', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const statusParam = url.searchParams.get('status')
  const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'skipped', 'rescheduled'] as const
  const status = statusParam && validStatuses.includes(statusParam as typeof validStatuses[number])
    ? statusParam as typeof validStatuses[number]
    : undefined

  const params = {
    lawnId: url.searchParams.get('lawn_id') || undefined,
    customerId: url.searchParams.get('customer_id') || undefined,
    operatorId: url.searchParams.get('operator_id') || undefined,
    scheduledDate: url.searchParams.get('scheduled_date') || undefined,
    dateFrom: url.searchParams.get('date_from') || undefined,
    dateTo: url.searchParams.get('date_to') || undefined,
    status,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await jobService.listJobs(supabase, params)
  return c.json(result)
})

// Get job by ID
app.get('/jobs/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await jobService.getJob(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Job not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create job
app.post('/jobs', zodValidator(createJobSchema), async c => {
  const { supabase, body } = c.var

  // Validate lawn exists
  const lawnExists = await lawnService.lawnExists(supabase, body.lawn_id)
  if (!lawnExists) {
    return c.json({ error: 'Lawn not found' }, 404)
  }

  const result = await jobService.createJob(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update job
app.put('/jobs/:id', zodValidator(updateJobSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await jobService.updateJob(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Job not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete job
app.delete('/jobs/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await jobService.deleteJob(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Job not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Add treatment to job
app.post('/jobs/:id/treatments', zodValidator(addJobTreatmentSchema), async c => {
  const { supabase, body } = c.var
  const jobId = c.req.param('id')

  // Validate job exists
  const jobExists = await jobService.jobExists(supabase, jobId)
  if (!jobExists) {
    return c.json({ error: 'Job not found' }, 404)
  }

  // Validate treatment exists
  const treatmentExists = await treatmentService.treatmentExists(supabase, body.treatment_id)
  if (!treatmentExists) {
    return c.json({ error: 'Treatment not found' }, 404)
  }

  const result = await jobService.addJobTreatment(supabase, jobId, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Add consumption to job
app.post('/jobs/:id/consumptions', zodValidator(addJobConsumptionSchema), async c => {
  const { supabase, body } = c.var
  const jobId = c.req.param('id')

  // Validate job exists
  const jobExists = await jobService.jobExists(supabase, jobId)
  if (!jobExists) {
    return c.json({ error: 'Job not found' }, 404)
  }

  // Validate product exists
  const productExists = await productService.productExists(supabase, body.product_id)
  if (!productExists) {
    return c.json({ error: 'Product not found' }, 404)
  }

  // Validate warehouse exists
  const warehouseExists = await warehouseService.warehouseExists(supabase, body.warehouse_id)
  if (!warehouseExists) {
    return c.json({ error: 'Warehouse not found' }, 404)
  }

  const result = await jobService.addJobConsumption(supabase, { ...body, job_id: jobId })

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Start job
app.post('/jobs/:id/start', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await jobService.startJob(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Job not found or not in scheduled status' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Complete job
app.post('/jobs/:id/complete', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  let afterNotes: string | undefined
  let lawnConditionAtJob: string | undefined

  try {
    const body = await c.req.json()
    afterNotes = body.after_notes
    lawnConditionAtJob = body.lawn_condition_at_job
  } catch {
    // Body is optional
  }

  const result = await jobService.completeJob(supabase, id, afterNotes, lawnConditionAtJob)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Job not found or not in progress' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Skip job
app.post('/jobs/:id/skip', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  let reason: string | undefined

  try {
    const body = await c.req.json()
    reason = body.reason
  } catch {
    // Body is optional
  }

  const result = await jobService.skipJob(supabase, id, reason)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Job not found or cannot be skipped' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
