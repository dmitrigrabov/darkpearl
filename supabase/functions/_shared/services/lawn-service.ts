import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Lawn, CreateLawnRequest, UpdateLawnRequest } from '../types.ts'

export type ListLawnsParams = {
  propertyId?: string
  customerId?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export async function listLawns(client: Client, params: ListLawnsParams = {}) {
  const { propertyId, customerId, isActive, limit = 100, offset = 0 } = params

  let query = client.from('lawns').select(
    `
    *,
    property:properties(
      id, address_line1, postcode, latitude, longitude,
      customer:customers(id, customer_number, first_name, last_name)
    )
  `,
    { count: 'exact' }
  )

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }
  if (customerId) {
    query = query.eq('property.customer_id', customerId)
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

export async function getLawn(client: Client, id: string) {
  return await client
    .from('lawns')
    .select(
      `
      *,
      property:properties(
        id, address_line1, postcode, latitude, longitude,
        customer:customers(id, customer_number, first_name, last_name)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createLawn(
  client: Client,
  data: CreateLawnRequest
): Promise<PostgrestSingleResponse<Lawn>> {
  return await client
    .from('lawns')
    .insert({
      property_id: data.property_id,
      name: data.name,
      area_sqm: data.area_sqm,
      lawn_condition: data.lawn_condition ?? 'new',
      boundary: data.boundary,
      access_notes: data.access_notes,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateLawn(
  client: Client,
  id: string,
  data: UpdateLawnRequest
): Promise<PostgrestSingleResponse<Lawn>> {
  return await client.from('lawns').update(data).eq('id', id).select().single()
}

export async function deleteLawn(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('lawns').delete().eq('id', id).select().single()
}

export async function lawnExists(client: Client, lawnId: string): Promise<boolean> {
  const { data } = await client.from('lawns').select('id').eq('id', lawnId).single()
  return !!data
}
