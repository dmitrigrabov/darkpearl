import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createCustomerSchema, updateCustomerSchema } from '../_shared/schemas.ts'
import * as customerService from '../_shared/services/customer-service.ts'
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

// List customers
app.get('/customers', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const params = {
    isActive: url.searchParams.get('is_active') === 'true' ? true : url.searchParams.get('is_active') === 'false' ? false : undefined,
    search: url.searchParams.get('search') || undefined,
    postcode: url.searchParams.get('postcode') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await customerService.listCustomers(supabase, params)
  return c.json(result)
})

// Get customer by ID
app.get('/customers/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await customerService.getCustomer(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Customer not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create customer
app.post('/customers', zodValidator(createCustomerSchema), async c => {
  const { supabase, body } = c.var

  const result = await customerService.createCustomer(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Customer with this number already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Update customer
app.put('/customers/:id', zodValidator(updateCustomerSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await customerService.updateCustomer(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Customer not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete customer
app.delete('/customers/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await customerService.deleteCustomer(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Customer not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
