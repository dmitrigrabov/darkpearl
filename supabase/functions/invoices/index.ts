import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { match, P } from 'ts-pattern'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  addInvoiceItemSchema,
  updateInvoiceItemSchema
} from '../_shared/schemas.ts'
import * as invoiceService from '../_shared/services/invoice-service.ts'
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

// List invoices
app.get('/invoices', async c => {
  const { supabase } = c.var
  const url = new URL(c.req.url)

  const statusParam = url.searchParams.get('status')
  const validStatuses = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded'] as const
  const status = statusParam && validStatuses.includes(statusParam as typeof validStatuses[number])
    ? statusParam as typeof validStatuses[number]
    : undefined

  const params = {
    customerId: url.searchParams.get('customer_id') || undefined,
    status,
    overdue: url.searchParams.get('overdue') === 'true',
    dateFrom: url.searchParams.get('date_from') || undefined,
    dateTo: url.searchParams.get('date_to') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
  }

  const result = await invoiceService.listInvoices(supabase, params)
  return c.json(result)
})

// Get invoice by ID
app.get('/invoices/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await invoiceService.getInvoice(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Create invoice
app.post('/invoices', zodValidator(createInvoiceSchema), async c => {
  const { supabase, body } = c.var

  // Validate customer exists
  const customerExists = await customerService.customerExists(supabase, body.customer_id)
  if (!customerExists) {
    return c.json({ error: 'Customer not found' }, 404)
  }

  const result = await invoiceService.createInvoice(supabase, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update invoice
app.put('/invoices/:id', zodValidator(updateInvoiceSchema), async c => {
  const { supabase, body } = c.var
  const id = c.req.param('id')

  const result = await invoiceService.updateInvoice(supabase, id, body)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Delete invoice
app.delete('/invoices/:id', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await invoiceService.deleteInvoice(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Add item to invoice
app.post('/invoices/:id/items', zodValidator(addInvoiceItemSchema), async c => {
  const { supabase, body } = c.var
  const invoiceId = c.req.param('id')

  // Validate invoice exists
  const invoiceExists = await invoiceService.invoiceExists(supabase, invoiceId)
  if (!invoiceExists) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  const result = await invoiceService.addInvoiceItem(supabase, invoiceId, body)

  if (result.data) {
    // Recalculate invoice totals
    await invoiceService.recalculateInvoiceTotals(supabase, invoiceId)
  }

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .otherwise(() => {
      throw result.error
    })
})

// Update invoice item
app.put('/invoices/:id/items/:itemId', zodValidator(updateInvoiceItemSchema), async c => {
  const { supabase, body } = c.var
  const invoiceId = c.req.param('id')
  const itemId = c.req.param('itemId')

  const result = await invoiceService.updateInvoiceItem(supabase, invoiceId, itemId, body)

  if (result.data) {
    // Recalculate invoice totals
    await invoiceService.recalculateInvoiceTotals(supabase, invoiceId)
  }

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice item not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Remove item from invoice
app.delete('/invoices/:id/items/:itemId', async c => {
  const { supabase } = c.var
  const invoiceId = c.req.param('id')
  const itemId = c.req.param('itemId')

  const result = await invoiceService.removeInvoiceItem(supabase, invoiceId, itemId)

  if (result.data) {
    // Recalculate invoice totals
    await invoiceService.recalculateInvoiceTotals(supabase, invoiceId)
  }

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ success: true }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice item not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

// Send invoice
app.post('/invoices/:id/send', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  const result = await invoiceService.sendInvoice(supabase, id)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () =>
      c.json({ error: 'Invoice not found or not in draft status' }, 404)
    )
    .otherwise(() => {
      throw result.error
    })
})

// Mark invoice as paid
app.post('/invoices/:id/mark-paid', async c => {
  const { supabase } = c.var
  const id = c.req.param('id')

  let amountPaid: number | undefined

  try {
    const body = await c.req.json()
    amountPaid = body.amount_paid
  } catch {
    // Body is optional
  }

  const result = await invoiceService.markInvoicePaid(supabase, id, amountPaid)

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Invoice not found' }, 404))
    .otherwise(() => {
      throw result.error
    })
})

Deno.serve(app.fetch)
