import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createServiceClient } from '../_shared/supabase-client.ts';
import * as outboxService from '../_shared/services/outbox-service.ts';
import * as sagaService from '../_shared/services/saga-service.ts';
import { SagaStartPayloadSchema, SagaStepPayloadSchema } from '../_shared/schemas.ts';

const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

type Variables = {
  serviceClient: ReturnType<typeof createServiceClient>;
};

const app = new Hono<{ Variables: Variables }>();

app.use('/saga-worker/*', cors());

// Supabase service client middleware
app.use('/saga-worker/*', async (c, next) => {
  c.set('serviceClient', createServiceClient());
  await next();
});

app.onError((err, c) => {
  console.error('Saga worker error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// Process outbox events
app.post('/saga-worker', async (c) => {
  const supabase = c.get('serviceClient');

  console.log('Saga worker: Starting outbox processing');

  // Fetch unprocessed outbox events
  const events = await outboxService.fetchUnprocessedEvents(supabase, BATCH_SIZE, MAX_RETRIES);

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
      await outboxService.markEventProcessed(supabase, event.id);

      results.push({ id: event.id, status: 'processed' });
      console.log(`Outbox event ${event.id} processed successfully`);
    } catch (err) {
      const eventError = err as Error;
      console.error(`Failed to process outbox event ${event.id}:`, eventError);

      // Increment retry count
      await outboxService.incrementRetryCount(supabase, event.id, event.retry_count ?? 0);

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
  const parseResult = SagaStartPayloadSchema.safeParse(event.payload);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid saga_start payload: ${errors}`);
  }
  const payload = parseResult.data;

  // Check if saga already exists (idempotency)
  const existingSaga = await sagaService.getSagaByCorrelationId(supabase, event.aggregate_id);

  if (existingSaga) {
    console.log(`Saga already exists for order ${event.aggregate_id}, skipping creation`);
    return;
  }

  // Create new saga
  const saga = await sagaService.createSaga(supabase, {
    saga_type: payload.saga_type,
    correlation_id: event.aggregate_id,
    payload: {
      order_id: payload.order_id,
      warehouse_id: payload.warehouse_id,
      items: payload.items,
    },
  });

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
  const parseResult = SagaStepPayloadSchema.safeParse(event.payload);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid saga_step payload: ${errors}`);
  }
  const { saga_id, action, step_result, error } = parseResult.data;

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
