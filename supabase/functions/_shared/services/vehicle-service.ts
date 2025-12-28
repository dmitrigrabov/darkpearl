import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types.ts'

export type ListVehiclesParams = {
  depotId?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export async function listVehicles(client: Client, params: ListVehiclesParams = {}) {
  const { depotId, isActive, limit = 100, offset = 0 } = params

  let query = client.from('vehicles').select(
    `
    *,
    depot:warehouses(id, code, name)
  `,
    { count: 'exact' }
  )

  if (depotId) {
    query = query.eq('depot_id', depotId)
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

export async function getVehicle(client: Client, id: string) {
  return await client
    .from('vehicles')
    .select(
      `
      *,
      depot:warehouses(id, code, name)
    `
    )
    .eq('id', id)
    .single()
}

export async function createVehicle(
  client: Client,
  data: CreateVehicleRequest
): Promise<PostgrestSingleResponse<Vehicle>> {
  return await client
    .from('vehicles')
    .insert({
      registration: data.registration,
      depot_id: data.depot_id,
      make: data.make,
      vehicle_model: data.vehicle_model,
      cost_per_mile: data.cost_per_mile,
      load_capacity_kg: data.load_capacity_kg,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateVehicle(
  client: Client,
  id: string,
  data: UpdateVehicleRequest
): Promise<PostgrestSingleResponse<Vehicle>> {
  return await client.from('vehicles').update(data).eq('id', id).select().single()
}

export async function deleteVehicle(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('vehicles').delete().eq('id', id).select().single()
}

export async function vehicleExists(client: Client, vehicleId: string): Promise<boolean> {
  const { data } = await client.from('vehicles').select('id').eq('id', vehicleId).single()
  return !!data
}
