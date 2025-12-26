import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.ts';

type Client = SupabaseClient<Database>;

export interface OutboxEvent {
  id: number;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
  retry_count: number;
}

export async function addOutboxEvent(
  client: Client,
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: Record<string, unknown>
): Promise<number> {
  const { data, error } = await client.rpc('add_outbox_event', {
    p_event_type: eventType,
    p_aggregate_type: aggregateType,
    p_aggregate_id: aggregateId,
    p_payload: payload,
  });

  if (error) throw error;
  return data as number;
}

export async function fetchUnprocessedEvents(
  client: Client,
  maxRetries: number,
  limit: number
): Promise<OutboxEvent[]> {
  const { data, error } = await client
    .from('outbox')
    .select('*')
    .is('processed_at', null)
    .lt('retry_count', maxRetries)
    .order('id', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as OutboxEvent[];
}

export async function markEventProcessed(client: Client, id: number): Promise<void> {
  const { error } = await client
    .from('outbox')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function incrementRetryCount(client: Client, id: number, currentCount: number): Promise<void> {
  const { error } = await client
    .from('outbox')
    .update({ retry_count: currentCount + 1 })
    .eq('id', id);

  if (error) throw error;
}
