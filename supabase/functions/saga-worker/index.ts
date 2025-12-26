import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createServiceClient } from '../_shared/supabase-client.ts';

const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

type Variables = {
  serviceClient: ReturnType<typeof createServiceClient>;
};

const app = new Hono<{ Variables: Variables }>().basePath('/saga-worker');

app.use('/*', cors());

// Supabase service client middleware
app.use('/*', async (c, next) => {
  c.set('serviceClient', createServiceClient());
  await next();
});

app.onError((err, c) => {
  console.error('Saga worker error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// Process outbox events
app.post('/', async (c) => {
  const supabase = c.get('serviceClient');

  console.log('Saga worker: Starting outbox processing');

  // Fetch unprocessed outbox events
  const { data: events, error: fetchError } = await supabase
    .from('outbox')
    .select('*')
    .is('processed_at', null)
    .lt('retry_count', MAX_RETRIES)
    .order('id', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) throw fetchError;

  if (!events || events.length === 0) {
    console.log('Saga worker: No events to process');
    return c.json({ message: 'No events to process', processed: 0 });
  }

  console.log(`Saga worker: Found ${events.length} events to process`);

  const results: Array<{ id: number; status: string; error?: string }> = [];

  for (const event of events) {
    try {
      console.log(`Processing outbox event ${event.id}: ${event.event_type}`);

      if (event.event_type === 'saga_start') {
        await processSagaStart(supabase, event);
      } else if (event.event_type === 'saga_step') {
        await processSagaStep(event);
      } else {
        console.log(`Unknown event type: ${event.event_type}`);
      }

      // Mark as processed
      await supabase
        .from('outbox')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', event.id);

      results.push({ id: event.id, status: 'processed' });
      console.log(`Outbox event ${event.id} processed successfully`);
    } catch (err) {
      const eventError = err as Error;
      console.error(`Failed to process outbox event ${event.id}:`, eventError);

      // Increment retry count
      await supabase
        .from('outbox')
        .update({ retry_count: event.retry_count + 1 })
        .eq('id', event.id);

      results.push({
        id: event.id,
        status: 'failed',
        error: eventError.message,
      });
    }
  }

  const processed = results.filter((r) => r.status === 'processed').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  console.log(`Saga worker: Completed. Processed: ${processed}, Failed: ${failed}`);

  return c.json({
    message: 'Outbox processing completed',
    processed,
    failed,
    results,
  });
});

Deno.serve(app.fetch);

/**
 * Process a saga_start event - creates a new saga and triggers execution
 */
async function processSagaStart(
  supabase: ReturnType<typeof createServiceClient>,
  event: { aggregate_id: string; payload: Record<string, unknown> }
) {
  const payload = event.payload as {
    saga_type: string;
    order_id: string;
    warehouse_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
  };

  // Check if saga already exists (idempotency)
  const { data: existingSaga } = await supabase
    .from('sagas')
    .select('id')
    .eq('correlation_id', event.aggregate_id)
    .single();

  if (existingSaga) {
    console.log(`Saga already exists for order ${event.aggregate_id}, skipping creation`);
    return;
  }

  // Create new saga
  const { data: saga, error: sagaError } = await supabase
    .from('sagas')
    .insert({
      saga_type: payload.saga_type,
      correlation_id: event.aggregate_id,
      status: 'started',
      payload: {
        order_id: payload.order_id,
        warehouse_id: payload.warehouse_id,
        items: payload.items,
      },
    })
    .select()
    .single();

  if (sagaError) throw sagaError;

  console.log(`Created saga ${saga.id} for order ${payload.order_id}`);

  // Trigger saga orchestrator to start execution
  const orchestratorUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saga-orchestrator`;

  const response = await fetch(orchestratorUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      saga_id: saga.id,
      action: 'execute_next',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Orchestrator call failed: ${errorText}`);
  }

  const result = await response.json();
  console.log(`Saga ${saga.id} orchestrator response:`, result);
}

/**
 * Process a saga_step event - continues an existing saga
 */
async function processSagaStep(
  event: { aggregate_id: string; payload: Record<string, unknown> }
) {
  const { saga_id, action, step_result, error } = event.payload as {
    saga_id: string;
    action: string;
    step_result?: Record<string, unknown>;
    error?: string;
  };

  // Trigger saga orchestrator
  const orchestratorUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saga-orchestrator`;

  const response = await fetch(orchestratorUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      saga_id,
      action,
      step_result,
      error,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Orchestrator call failed: ${errorText}`);
  }
}
