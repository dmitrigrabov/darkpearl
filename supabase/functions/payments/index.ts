import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { createPaymentSchema, updatePaymentSchema } from '../_shared/schemas.ts'
import * as paymentService from '../_shared/services/payment-service.ts'
import * as customerService from '../_shared/services/customer-service.ts'
import * as invoiceService from '../_shared/services/invoice-service.ts'
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

// List payments
app.get('/payments', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const methodParam = url.searchParams.get('payment_method')
  const validMethods = ['card', 'bank_transfer', 'direct_debit', 'cash', 'cheque'] as const
  const paymentMethod = methodParam && validMethods.includes(methodParam as typeof validMethods[number])
    ? methodParam as typeof validMethods[number]
    : undefined

  const params = {
    customerId: url.searchParams.get('customer_id') || undefined,
    invoiceId: url.searchParams.get('invoice_id') || undefined,
    paymentMethod,
    isConfirmed: url.searchParams.get('is_confirmed') === 'true' ? true : url.searchParams.get('is_confirmed') === 'false' ? false : undefined,
    dateFrom: url.searchParams.get('date_from') || undefined,
    dateTo: url.searchParams.get('date_to') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await paymentService.listPayments(supabase, params)
  return c.json(result)
})

// Get payment by ID
app.get('/payments/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await paymentService.getPayment(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Payment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create payment
app.post('/payments', zodValidator(createPaymentSchema), async c => {
  const { supabase, body } = c.var

  // Validate customer exists
  const customerExists = await customerService.customerExists(supabase, body.customer_id)
  if (!customerExists) {
    return c.json({ error: 'Customer not found' }, 404)
  }

  // Validate invoice exists if provided
  if (body.invoice_id) {
    const invoiceExists = await invoiceService.invoiceExists(supabase, body.invoice_id)
    if (!invoiceExists) {
      return c.json({ error: 'Invoice not found' }, 404)
    }
  }

  const result = await paymentService.createPayment(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update payment
app.put('/payments/:id', zodValidator(updatePaymentSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await paymentService.updatePayment(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Payment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete payment
app.delete('/payments/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await paymentService.deletePayment(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Payment not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Confirm payment
app.post('/payments/:id/confirm', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await paymentService.confirmPayment(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Payment not found or already confirmed' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
