import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Client,
  Treatment,
  TreatmentProduct,
  TreatmentSeason,
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  AddTreatmentProductRequest
} from '../types.ts'

export type ListTreatmentsParams = {
  season?: TreatmentSeason
  isActive?: boolean
  limit?: number
  offset?: number
}

export async function listTreatments(client: Client, params: ListTreatmentsParams = {}) {
  const { season, isActive, limit = 100, offset = 0 } = params

  let query = client.from('treatments').select('*', { count: 'exact' })

  if (season) {
    query = query.eq('season', season)
  }
  if (isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }

  const { data, error, count } = await query
    .order('sequence_in_year', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getTreatment(client: Client, id: string) {
  return await client
    .from('treatments')
    .select(
      `
      *,
      products:treatment_products(
        id, quantity_per_100sqm, quantity_multiplier_poor,
        product:products(id, sku, name, unit_price)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createTreatment(
  client: Client,
  data: CreateTreatmentRequest
): Promise<PostgrestSingleResponse<Treatment>> {
  return await client
    .from('treatments')
    .insert({
      code: data.code,
      name: data.name,
      description: data.description,
      price_per_sqm: data.price_per_sqm,
      min_price: data.min_price,
      minutes_per_100sqm: data.minutes_per_100sqm,
      setup_minutes: data.setup_minutes,
      season: data.season,
      sequence_in_year: data.sequence_in_year,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateTreatment(
  client: Client,
  id: string,
  data: UpdateTreatmentRequest
): Promise<PostgrestSingleResponse<Treatment>> {
  return await client.from('treatments').update(data).eq('id', id).select().single()
}

export async function deleteTreatment(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('treatments').delete().eq('id', id).select().single()
}

export async function treatmentExists(client: Client, treatmentId: string): Promise<boolean> {
  const { data } = await client.from('treatments').select('id').eq('id', treatmentId).single()
  return !!data
}

// Treatment products sub-resource
export async function addTreatmentProduct(
  client: Client,
  treatmentId: string,
  data: AddTreatmentProductRequest
): Promise<PostgrestSingleResponse<TreatmentProduct>> {
  return await client
    .from('treatment_products')
    .insert({
      treatment_id: treatmentId,
      product_id: data.product_id,
      quantity_per_100sqm: data.quantity_per_100sqm,
      quantity_multiplier_poor: data.quantity_multiplier_poor ?? 1.5
    })
    .select()
    .single()
}

export async function removeTreatmentProduct(
  client: Client,
  treatmentId: string,
  productId: string
): Promise<PostgrestSingleResponse<null>> {
  return await client
    .from('treatment_products')
    .delete()
    .eq('treatment_id', treatmentId)
    .eq('product_id', productId)
    .select()
    .single()
}
