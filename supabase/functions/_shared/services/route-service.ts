import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Client,
  Route,
  RouteStop,
  CreateRouteRequest,
  UpdateRouteRequest,
  AddRouteStopRequest,
  UpdateRouteStopRequest
} from '../types.ts'

export type ListRoutesParams = {
  operatorId?: string
  depotId?: string
  routeDate?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  limit?: number
  offset?: number
}

export async function listRoutes(client: Client, params: ListRoutesParams = {}) {
  const { operatorId, depotId, routeDate, dateFrom, dateTo, status, limit = 100, offset = 0 } = params

  let query = client.from('routes').select(
    `
    *,
    operator:operators(id, employee_number, first_name, last_name),
    depot:warehouses(id, code, name),
    vehicle:vehicles(id, registration, make, vehicle_model)
  `,
    { count: 'exact' }
  )

  if (operatorId) {
    query = query.eq('operator_id', operatorId)
  }
  if (depotId) {
    query = query.eq('depot_id', depotId)
  }
  if (routeDate) {
    query = query.eq('route_date', routeDate)
  }
  if (dateFrom) {
    query = query.gte('route_date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('route_date', dateTo)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('route_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getRoute(client: Client, id: string) {
  return await client
    .from('routes')
    .select(
      `
      *,
      operator:operators(id, employee_number, first_name, last_name),
      depot:warehouses(id, code, name),
      vehicle:vehicles(id, registration, make, vehicle_model),
      stops:route_stops(
        id, stop_order, estimated_arrival, estimated_departure, actual_arrival, actual_departure, distance_from_previous_miles,
        lawn:lawns(
          id, name, area_sqm,
          property:properties(id, address_line1, postcode, latitude, longitude)
        ),
        job:jobs(id, job_number, status)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createRoute(
  client: Client,
  data: CreateRouteRequest
): Promise<PostgrestSingleResponse<Route>> {
  return await client
    .from('routes')
    .insert({
      operator_id: data.operator_id,
      depot_id: data.depot_id,
      vehicle_id: data.vehicle_id,
      route_date: data.route_date,
      status: data.status ?? 'draft',
      estimated_duration_minutes: data.estimated_duration_minutes,
      estimated_distance_miles: data.estimated_distance_miles,
      notes: data.notes
    })
    .select()
    .single()
}

export async function updateRoute(
  client: Client,
  id: string,
  data: UpdateRouteRequest
): Promise<PostgrestSingleResponse<Route>> {
  return await client.from('routes').update(data).eq('id', id).select().single()
}

export async function deleteRoute(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('routes').delete().eq('id', id).select().single()
}

export async function routeExists(client: Client, routeId: string): Promise<boolean> {
  const { data } = await client.from('routes').select('id').eq('id', routeId).single()
  return !!data
}

// Route stops sub-resource
export async function addRouteStop(
  client: Client,
  routeId: string,
  data: AddRouteStopRequest
): Promise<PostgrestSingleResponse<RouteStop>> {
  return await client
    .from('route_stops')
    .insert({
      route_id: routeId,
      lawn_id: data.lawn_id,
      stop_order: data.stop_order,
      estimated_arrival: data.estimated_arrival,
      estimated_departure: data.estimated_departure,
      distance_from_previous_miles: data.distance_from_previous_miles
    })
    .select()
    .single()
}

export async function updateRouteStop(
  client: Client,
  routeId: string,
  stopId: string,
  data: UpdateRouteStopRequest
): Promise<PostgrestSingleResponse<RouteStop>> {
  return await client
    .from('route_stops')
    .update(data)
    .eq('route_id', routeId)
    .eq('id', stopId)
    .select()
    .single()
}

export async function removeRouteStop(
  client: Client,
  routeId: string,
  stopId: string
): Promise<PostgrestSingleResponse<null>> {
  return await client
    .from('route_stops')
    .delete()
    .eq('route_id', routeId)
    .eq('id', stopId)
    .select()
    .single()
}

// Route actions
export async function startRoute(client: Client, id: string): Promise<PostgrestSingleResponse<Route>> {
  return await client
    .from('routes')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'confirmed')
    .select()
    .single()
}

export async function completeRoute(
  client: Client,
  id: string,
  actualDurationMinutes?: number,
  actualDistanceMiles?: number
): Promise<PostgrestSingleResponse<Route>> {
  return await client
    .from('routes')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_duration_minutes: actualDurationMinutes,
      actual_distance_miles: actualDistanceMiles
    })
    .eq('id', id)
    .eq('status', 'in_progress')
    .select()
    .single()
}
