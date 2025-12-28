import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../types.ts'

export type ListPaymentsParams = {
  customerId?: string
  invoiceId?: string
  paymentMethod?: string
  isConfirmed?: boolean
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export async function listPayments(client: Client, params: ListPaymentsParams = {}) {
  const { customerId, invoiceId, paymentMethod, isConfirmed, dateFrom, dateTo, limit = 100, offset = 0 } = params

  let query = client.from('payments').select(
    `
    *,
    customer:customers(id, customer_number, first_name, last_name),
    invoice:invoices(id, invoice_number, total_amount, status)
  `,
    { count: 'exact' }
  )

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }
  if (invoiceId) {
    query = query.eq('invoice_id', invoiceId)
  }
  if (paymentMethod) {
    query = query.eq('payment_method', paymentMethod)
  }
  if (isConfirmed !== undefined) {
    query = query.eq('is_confirmed', isConfirmed)
  }
  if (dateFrom) {
    query = query.gte('payment_date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('payment_date', dateTo)
  }

  const { data, error, count } = await query
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getPayment(client: Client, id: string) {
  return await client
    .from('payments')
    .select(
      `
      *,
      customer:customers(id, customer_number, first_name, last_name, email, phone),
      invoice:invoices(id, invoice_number, issue_date, due_date, total_amount, status)
    `
    )
    .eq('id', id)
    .single()
}

export async function createPayment(
  client: Client,
  data: CreatePaymentRequest
): Promise<PostgrestSingleResponse<Payment>> {
  return await client
    .from('payments')
    .insert({
      customer_id: data.customer_id,
      invoice_id: data.invoice_id,
      amount: data.amount,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      payment_method: data.payment_method,
      payment_reference: data.payment_reference,
      notes: data.notes,
      is_confirmed: false
    })
    .select()
    .single()
}

export async function updatePayment(
  client: Client,
  id: string,
  data: UpdatePaymentRequest
): Promise<PostgrestSingleResponse<Payment>> {
  return await client.from('payments').update(data).eq('id', id).select().single()
}

export async function deletePayment(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('payments').delete().eq('id', id).select().single()
}

export async function paymentExists(client: Client, paymentId: string): Promise<boolean> {
  const { data } = await client.from('payments').select('id').eq('id', paymentId).single()
  return !!data
}

// Payment actions
export async function confirmPayment(client: Client, id: string): Promise<PostgrestSingleResponse<Payment>> {
  return await client
    .from('payments')
    .update({ is_confirmed: true })
    .eq('id', id)
    .eq('is_confirmed', false)
    .select()
    .single()
}
