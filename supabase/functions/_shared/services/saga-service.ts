import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types.ts'
import type { Saga, SagaStatus, SagaStepType } from '../types.ts'

type Client = SupabaseClient<Database>

export async function getSaga(client: Client, id: string): Promise<Saga | null> {
  const { data, error } = await client.from('sagas').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getSagaByCorrelationId(
  client: Client,
  correlationId: string
): Promise<Saga | null> {
  const { data, error } = await client
    .from('sagas')
    .select('*')
    .eq('correlation_id', correlationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getSagaStatus(
  client: Client,
  correlationId: string
): Promise<{
  id: string
  status: SagaStatus
  current_step: SagaStepType | null
  error_message: string | null
  created_at: string
  completed_at: string | null
} | null> {
  const { data, error } = await client
    .from('sagas')
    .select('id, status, current_step, error_message, created_at, completed_at')
    .eq('correlation_id', correlationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateSagaStatus(
  client: Client,
  id: string,
  status: SagaStatus,
  errorMessage?: string | null
): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (status === 'completed' || status === 'failed') {
    update.completed_at = new Date().toISOString()
  }
  if (errorMessage !== undefined) {
    update.error_message = errorMessage
  }

  const { error } = await client.from('sagas').update(update).eq('id', id)
  if (error) throw error
}

export async function updateSagaStep(
  client: Client,
  id: string,
  currentStep: SagaStepType,
  status: SagaStatus,
  payload?: Record<string, unknown>
): Promise<void> {
  const update: Record<string, unknown> = {
    current_step: currentStep,
    status
  }
  if (payload) {
    update.payload = payload
  }

  const { error } = await client.from('sagas').update(update).eq('id', id)
  if (error) throw error
}

export async function recordSagaEvent(
  client: Client,
  sagaId: string,
  stepType: SagaStepType,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { error } = await client.from('saga_events').insert({
    saga_id: sagaId,
    step_type: stepType,
    event_type: eventType,
    payload
  })

  if (error) throw error
}

export async function getSagaWithEvents(
  client: Client,
  correlationId: string
): Promise<{
  id: string
  status: SagaStatus
  current_step: SagaStepType | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  events: Array<{
    id: string
    step_type: SagaStepType
    event_type: string
    payload: Record<string, unknown>
    created_at: string
  }>
} | null> {
  const { data: saga, error: sagaError } = await client
    .from('sagas')
    .select('id, status, current_step, error_message, created_at, completed_at')
    .eq('correlation_id', correlationId)
    .single()

  if (sagaError) {
    if (sagaError.code === 'PGRST116') return null
    throw sagaError
  }

  const { data: events, error: eventsError } = await client
    .from('saga_events')
    .select('id, step_type, event_type, payload, created_at')
    .eq('saga_id', saga.id)
    .order('created_at', { ascending: true })

  if (eventsError) throw eventsError

  return {
    ...saga,
    events: events ?? []
  }
}
