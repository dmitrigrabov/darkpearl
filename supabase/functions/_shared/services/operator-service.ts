import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Client, Operator, CreateOperatorRequest, UpdateOperatorRequest } from '../types.ts'

export type ListOperatorsParams = {
  depotId?: string
  isActive?: boolean
  search?: string
  limit?: number
  offset?: number
}

export async function listOperators(client: Client, params: ListOperatorsParams = {}) {
  const { depotId, isActive, search, limit = 100, offset = 0 } = params

  let query = client.from('operators').select(
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
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_number.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getOperator(client: Client, id: string) {
  return await client
    .from('operators')
    .select(
      `
      *,
      depot:warehouses(id, code, name)
    `
    )
    .eq('id', id)
    .single()
}

export async function createOperator(
  client: Client,
  data: CreateOperatorRequest
): Promise<PostgrestSingleResponse<Operator>> {
  return await client
    .from('operators')
    .insert({
      employee_number: data.employee_number,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      depot_id: data.depot_id,
      user_id: data.user_id,
      hourly_cost: data.hourly_cost,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateOperator(
  client: Client,
  id: string,
  data: UpdateOperatorRequest
): Promise<PostgrestSingleResponse<Operator>> {
  return await client.from('operators').update(data).eq('id', id).select().single()
}

export async function deleteOperator(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('operators').delete().eq('id', id).select().single()
}

export async function operatorExists(client: Client, operatorId: string): Promise<boolean> {
  const { data } = await client.from('operators').select('id').eq('id', operatorId).single()
  return !!data
}
