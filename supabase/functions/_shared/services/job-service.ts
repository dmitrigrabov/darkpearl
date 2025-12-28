import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  Client,
  Job,
  JobTreatment,
  JobConsumption,
  JobStatus,
  CreateJobRequest,
  UpdateJobRequest,
  AddJobTreatmentRequest,
  AddJobConsumptionRequest
} from '../types.ts'

export type ListJobsParams = {
  lawnId?: string
  customerId?: string
  operatorId?: string
  scheduledDate?: string
  dateFrom?: string
  dateTo?: string
  status?: JobStatus
  limit?: number
  offset?: number
}

export async function listJobs(client: Client, params: ListJobsParams = {}) {
  const { lawnId, customerId, operatorId, scheduledDate, dateFrom, dateTo, status, limit = 100, offset = 0 } = params

  let query = client.from('jobs').select(
    `
    *,
    lawn:lawns(
      id, name, area_sqm,
      property:properties(
        id, address_line1, postcode,
        customer:customers(id, customer_number, first_name, last_name)
      )
    ),
    operator:operators(id, employee_number, first_name, last_name)
  `,
    { count: 'exact' }
  )

  if (lawnId) {
    query = query.eq('lawn_id', lawnId)
  }
  if (customerId) {
    query = query.eq('lawn.property.customer_id', customerId)
  }
  if (operatorId) {
    query = query.eq('performed_by', operatorId)
  }
  if (scheduledDate) {
    query = query.eq('scheduled_date', scheduledDate)
  }
  if (dateFrom) {
    query = query.gte('scheduled_date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('scheduled_date', dateTo)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('scheduled_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getJob(client: Client, id: string) {
  return await client
    .from('jobs')
    .select(
      `
      *,
      lawn:lawns(
        id, name, area_sqm, lawn_condition,
        property:properties(
          id, address_line1, postcode, latitude, longitude, access_notes,
          customer:customers(id, customer_number, first_name, last_name, phone, email)
        )
      ),
      operator:operators(id, employee_number, first_name, last_name),
      treatments:job_treatments(
        id, price_charged, duration_minutes,
        treatment:treatments(id, code, name)
      ),
      consumptions:job_consumptions(
        id, quantity_consumed,
        product:products(id, sku, name),
        warehouse:warehouses(id, code, name)
      )
    `
    )
    .eq('id', id)
    .single()
}

export async function createJob(
  client: Client,
  data: CreateJobRequest
): Promise<PostgrestSingleResponse<Job>> {
  // Generate job number: JOB-YYYYMMDD-NNN
  const jobNumber = await generateJobNumber(client)

  return await client
    .from('jobs')
    .insert({
      job_number: jobNumber,
      lawn_id: data.lawn_id,
      performed_by: data.performed_by,
      route_stop_id: data.route_stop_id,
      treatment_plan_item_id: data.treatment_plan_item_id,
      scheduled_date: data.scheduled_date,
      lawn_area_sqm: data.lawn_area_sqm,
      status: data.status ?? 'scheduled',
      lawn_condition_at_job: data.lawn_condition_at_job,
      before_notes: data.before_notes,
      after_notes: data.after_notes
    })
    .select()
    .single()
}

async function generateJobNumber(client: Client): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const startOfDay = today.toISOString().split('T')[0] + 'T00:00:00Z'
  const endOfDay = today.toISOString().split('T')[0] + 'T23:59:59Z'

  const { count } = await client
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  const seqNum = (count ?? 0) + 1
  return `JOB-${dateStr}-${seqNum.toString().padStart(3, '0')}`
}

export async function updateJob(
  client: Client,
  id: string,
  data: UpdateJobRequest
): Promise<PostgrestSingleResponse<Job>> {
  return await client.from('jobs').update(data).eq('id', id).select().single()
}

export async function deleteJob(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('jobs').delete().eq('id', id).select().single()
}

export async function jobExists(client: Client, jobId: string): Promise<boolean> {
  const { data } = await client.from('jobs').select('id').eq('id', jobId).single()
  return !!data
}

// Job treatments sub-resource
export async function addJobTreatment(
  client: Client,
  jobId: string,
  data: AddJobTreatmentRequest
): Promise<PostgrestSingleResponse<JobTreatment>> {
  return await client
    .from('job_treatments')
    .insert({
      job_id: jobId,
      treatment_id: data.treatment_id,
      price_charged: data.price_charged,
      duration_minutes: data.duration_minutes
    })
    .select()
    .single()
}

// Job consumptions sub-resource
export async function addJobConsumption(
  client: Client,
  data: AddJobConsumptionRequest & { job_id: string }
): Promise<PostgrestSingleResponse<JobConsumption>> {
  return await client
    .from('job_consumptions')
    .insert({
      job_id: data.job_id,
      job_treatment_id: data.job_treatment_id,
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      quantity_consumed: data.quantity_consumed
    })
    .select()
    .single()
}

// Job actions
export async function startJob(client: Client, id: string): Promise<PostgrestSingleResponse<Job>> {
  return await client
    .from('jobs')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'scheduled')
    .select()
    .single()
}

export async function completeJob(
  client: Client,
  id: string,
  afterNotes?: string,
  lawnConditionAtJob?: string
): Promise<PostgrestSingleResponse<Job>> {
  const updates: Record<string, unknown> = {
    status: 'completed',
    completed_at: new Date().toISOString()
  }
  if (afterNotes) updates.after_notes = afterNotes
  if (lawnConditionAtJob) updates.lawn_condition_at_job = lawnConditionAtJob

  return await client
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .eq('status', 'in_progress')
    .select()
    .single()
}

export async function skipJob(
  client: Client,
  id: string,
  reason?: string
): Promise<PostgrestSingleResponse<Job>> {
  return await client
    .from('jobs')
    .update({
      status: 'skipped',
      after_notes: reason
    })
    .eq('id', id)
    .in('status', ['scheduled', 'in_progress'])
    .select()
    .single()
}
