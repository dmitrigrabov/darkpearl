import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types.ts'

export type ListCustomersParams = {
  isActive?: boolean
  search?: string
  postcode?: string
  limit?: number
  offset?: number
}

export async function listCustomers(client: Client, params: ListCustomersParams = {}) {
  const { isActive, search, postcode, limit = 100, offset = 0 } = params

  let query = client.from('customers').select('*', { count: 'exact' })

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,customer_number.ilike.%${search}%`
    )
  }
  if (postcode) {
    query = query.ilike('billing_postcode', `${postcode}%`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getCustomer(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<Customer>> {
  return await client.from('customers').select('*').eq('id', id).single()
}

export async function createCustomer(
  client: Client,
  data: CreateCustomerRequest
): Promise<PostgrestSingleResponse<Customer>> {
  return await client
    .from('customers')
    .insert({
      customer_number: data.customer_number,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      phone_secondary: data.phone_secondary,
      preferred_contact_method: data.preferred_contact_method,
      billing_address_line1: data.billing_address_line1,
      billing_address_line2: data.billing_address_line2,
      billing_city: data.billing_city,
      billing_postcode: data.billing_postcode,
      marketing_consent: data.marketing_consent ?? false,
      notes: data.notes,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateCustomer(
  client: Client,
  id: string,
  data: UpdateCustomerRequest
): Promise<PostgrestSingleResponse<Customer>> {
  return await client.from('customers').update(data).eq('id', id).select().single()
}

export async function deleteCustomer(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('customers').delete().eq('id', id).select().single()
}

export async function customerExists(client: Client, customerId: string): Promise<boolean> {
  const { data } = await client.from('customers').select('id').eq('id', customerId).single()
  return !!data
}
