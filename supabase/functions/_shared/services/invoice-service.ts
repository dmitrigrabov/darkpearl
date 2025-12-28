import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Client,
  Invoice,
  InvoiceItem,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  AddInvoiceItemRequest,
  UpdateInvoiceItemRequest
} from '../types.ts'

export type ListInvoicesParams = {
  customerId?: string
  status?: string
  overdue?: boolean
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export async function listInvoices(client: Client, params: ListInvoicesParams = {}) {
  const { customerId, status, overdue, dateFrom, dateTo, limit = 100, offset = 0 } = params

  let query = client.from('invoices').select(
    `
    *,
    customer:customers(id, customer_number, first_name, last_name, email)
  `,
    { count: 'exact' }
  )

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (overdue) {
    query = query.lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'paid')
  }
  if (dateFrom) {
    query = query.gte('issue_date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('issue_date', dateTo)
  }

  const { data, error, count } = await query
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getInvoice(client: Client, id: string) {
  return await client
    .from('invoices')
    .select(
      `
      *,
      customer:customers(id, customer_number, first_name, last_name, email, phone, billing_address_line1, billing_city, billing_postcode),
      items:invoice_items(
        id, description, quantity, unit_price, line_total,
        job:jobs(id, job_number, scheduled_date)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createInvoice(
  client: Client,
  data: CreateInvoiceRequest
): Promise<PostgrestSingleResponse<Invoice>> {
  const issueDate = data.issue_date || new Date().toISOString().split('T')[0]
  const paymentTermsDays = data.payment_terms_days ?? 30
  const dueDate = data.due_date || calculateDueDate(issueDate, paymentTermsDays)

  return await client
    .from('invoices')
    .insert({
      customer_id: data.customer_id,
      issue_date: issueDate,
      due_date: dueDate,
      payment_terms_days: paymentTermsDays,
      vat_rate: data.vat_rate ?? 20,
      status: data.status ?? 'draft',
      notes: data.notes
    })
    .select()
    .single()
}

function calculateDueDate(issueDate: string, days: number): string {
  const date = new Date(issueDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export async function updateInvoice(
  client: Client,
  id: string,
  data: UpdateInvoiceRequest
): Promise<PostgrestSingleResponse<Invoice>> {
  return await client.from('invoices').update(data).eq('id', id).select().single()
}

export async function deleteInvoice(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('invoices').delete().eq('id', id).select().single()
}

export async function invoiceExists(client: Client, invoiceId: string): Promise<boolean> {
  const { data } = await client.from('invoices').select('id').eq('id', invoiceId).single()
  return !!data
}

// Invoice items sub-resource
export async function addInvoiceItem(
  client: Client,
  invoiceId: string,
  data: AddInvoiceItemRequest
): Promise<PostgrestSingleResponse<InvoiceItem>> {
  const lineTotal = data.quantity * data.unit_price

  return await client
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      job_id: data.job_id,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      line_total: lineTotal
    })
    .select()
    .single()
}

export async function updateInvoiceItem(
  client: Client,
  invoiceId: string,
  itemId: string,
  data: UpdateInvoiceItemRequest
): Promise<PostgrestSingleResponse<InvoiceItem>> {
  // Calculate line_total if quantity or unit_price is being updated
  const updateData: Record<string, unknown> = { ...data }
  if (data.quantity !== undefined || data.unit_price !== undefined) {
    // Get current item to calculate new line_total
    const { data: currentItem } = await client
      .from('invoice_items')
      .select('quantity, unit_price')
      .eq('id', itemId)
      .single()

    if (currentItem) {
      const quantity = data.quantity ?? currentItem.quantity
      const unitPrice = data.unit_price ?? currentItem.unit_price
      updateData.line_total = quantity * unitPrice
    }
  }

  return await client
    .from('invoice_items')
    .update(updateData)
    .eq('invoice_id', invoiceId)
    .eq('id', itemId)
    .select()
    .single()
}

export async function removeInvoiceItem(
  client: Client,
  invoiceId: string,
  itemId: string
): Promise<PostgrestSingleResponse<null>> {
  return await client
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoiceId)
    .eq('id', itemId)
    .select()
    .single()
}

// Invoice actions
export async function sendInvoice(client: Client, id: string): Promise<PostgrestSingleResponse<Invoice>> {
  return await client
    .from('invoices')
    .update({ status: 'sent' })
    .eq('id', id)
    .eq('status', 'draft')
    .select()
    .single()
}

export async function markInvoicePaid(
  client: Client,
  id: string,
  amountPaid?: number
): Promise<PostgrestSingleResponse<Invoice>> {
  // Get invoice to determine total amount
  const { data: invoice } = await client
    .from('invoices')
    .select('total_amount')
    .eq('id', id)
    .single()

  const updates: Record<string, unknown> = {
    status: 'paid',
    amount_paid: amountPaid ?? invoice?.total_amount ?? 0
  }

  return await client.from('invoices').update(updates).eq('id', id).select().single()
}

// Recalculate invoice totals
export async function recalculateInvoiceTotals(client: Client, invoiceId: string): Promise<void> {
  // Get all items
  const { data: items } = await client
    .from('invoice_items')
    .select('line_total')
    .eq('invoice_id', invoiceId)

  if (!items) return

  const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)

  // Get VAT rate
  const { data: invoice } = await client
    .from('invoices')
    .select('vat_rate')
    .eq('id', invoiceId)
    .single()

  const vatRate = invoice?.vat_rate ?? 20
  const vatAmount = subtotal * (vatRate / 100)
  const totalAmount = subtotal + vatAmount

  await client
    .from('invoices')
    .update({
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount
    })
    .eq('id', invoiceId)
}
