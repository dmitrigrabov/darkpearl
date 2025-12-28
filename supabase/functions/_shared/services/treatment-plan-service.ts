import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Client,
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanStatus,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  AddTreatmentPlanItemRequest,
  UpdateTreatmentPlanItemRequest
} from '../types.ts'

export type ListTreatmentPlansParams = {
  lawnId?: string
  customerId?: string
  year?: number
  status?: TreatmentPlanStatus
  limit?: number
  offset?: number
}

export async function listTreatmentPlans(client: Client, params: ListTreatmentPlansParams = {}) {
  const { lawnId, customerId, year, status, limit = 100, offset = 0 } = params

  let query = client.from('treatment_plans').select(
    `
    *,
    lawn:lawns(
      id, name, area_sqm,
      property:properties(
        id, address_line1, postcode,
        customer:customers(id, customer_number, first_name, last_name)
      )
    )
  `,
    { count: 'exact' }
  )

  if (lawnId) {
    query = query.eq('lawn_id', lawnId)
  }
  if (customerId) {
    query = query.eq('lawn.property.customer_id', customerId)
  }
  if (year) {
    query = query.eq('year', year)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getTreatmentPlan(client: Client, id: string) {
  return await client
    .from('treatment_plans')
    .select(
      `
      *,
      lawn:lawns(
        id, name, area_sqm,
        property:properties(
          id, address_line1, postcode,
          customer:customers(id, customer_number, first_name, last_name)
        )
      ),
      items:treatment_plan_items(
        id, window_start, window_end, scheduled_week, is_completed, price_snapshot,
        treatment:treatments(id, code, name, price_per_sqm)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createTreatmentPlan(
  client: Client,
  data: CreateTreatmentPlanRequest
): Promise<PostgrestSingleResponse<TreatmentPlan>> {
  return await client
    .from('treatment_plans')
    .insert({
      lawn_id: data.lawn_id,
      year: data.year,
      status: data.status ?? 'active',
      total_estimated_price: data.total_estimated_price,
      notes: data.notes
    })
    .select()
    .single()
}

export async function updateTreatmentPlan(
  client: Client,
  id: string,
  data: UpdateTreatmentPlanRequest
): Promise<PostgrestSingleResponse<TreatmentPlan>> {
  return await client.from('treatment_plans').update(data).eq('id', id).select().single()
}

export async function deleteTreatmentPlan(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('treatment_plans').delete().eq('id', id).select().single()
}

export async function treatmentPlanExists(client: Client, planId: string): Promise<boolean> {
  const { data } = await client.from('treatment_plans').select('id').eq('id', planId).single()
  return !!data
}

// Treatment plan items sub-resource
export async function addTreatmentPlanItem(
  client: Client,
  planId: string,
  data: AddTreatmentPlanItemRequest
): Promise<PostgrestSingleResponse<TreatmentPlanItem>> {
  return await client
    .from('treatment_plan_items')
    .insert({
      treatment_plan_id: planId,
      treatment_id: data.treatment_id,
      window_start: data.window_start,
      window_end: data.window_end,
      scheduled_week: data.scheduled_week,
      price_snapshot: data.price_snapshot
    })
    .select()
    .single()
}

export async function updateTreatmentPlanItem(
  client: Client,
  planId: string,
  itemId: string,
  data: UpdateTreatmentPlanItemRequest
): Promise<PostgrestSingleResponse<TreatmentPlanItem>> {
  return await client
    .from('treatment_plan_items')
    .update(data)
    .eq('treatment_plan_id', planId)
    .eq('id', itemId)
    .select()
    .single()
}

export async function removeTreatmentPlanItem(
  client: Client,
  planId: string,
  itemId: string
): Promise<PostgrestSingleResponse<null>> {
  return await client
    .from('treatment_plan_items')
    .delete()
    .eq('treatment_plan_id', planId)
    .eq('id', itemId)
    .select()
    .single()
}
