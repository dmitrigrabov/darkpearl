import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Property, CreatePropertyRequest, UpdatePropertyRequest } from '../types.ts'

export type ListPropertiesParams = {
  customerId?: string
  postcode?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export async function listProperties(client: Client, params: ListPropertiesParams = {}) {
  const { customerId, postcode, isActive, limit = 100, offset = 0 } = params

  let query = client.from('properties').select(
    `
    *,
    customer:customers(id, customer_number, first_name, last_name)
  `,
    { count: 'exact' }
  )

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }
  if (postcode) {
    query = query.ilike('postcode', `${postcode}%`)
  }
  if (isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getProperty(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<Property & { customer: { id: string; customer_number: string; first_name: string; last_name: string } | null }>> {
  return await client
    .from('properties')
    .select(
      `
      *,
      customer:customers(id, customer_number, first_name, last_name)
    `
    )
    .eq('id', id)
    .single()
}

export async function createProperty(
  client: Client,
  data: CreatePropertyRequest
): Promise<PostgrestSingleResponse<Property>> {
  return await client
    .from('properties')
    .insert({
      customer_id: data.customer_id,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      postcode: data.postcode,
      latitude: data.latitude,
      longitude: data.longitude,
      access_notes: data.access_notes,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateProperty(
  client: Client,
  id: string,
  data: UpdatePropertyRequest
): Promise<PostgrestSingleResponse<Property>> {
  return await client.from('properties').update(data).eq('id', id).select().single()
}

export async function deleteProperty(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('properties').delete().eq('id', id).select().single()
}

export async function propertyExists(client: Client, propertyId: string): Promise<boolean> {
  const { data } = await client.from('properties').select('id').eq('id', propertyId).single()
  return !!data
}
