-- Enable pg_net extension for HTTP calls from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add trigger_run_id column to sagas table for trigger.dev tracking
ALTER TABLE sagas ADD COLUMN IF NOT EXISTS trigger_run_id TEXT;
CREATE INDEX IF NOT EXISTS idx_sagas_trigger_run ON sagas(trigger_run_id);

-- Function to trigger saga via Edge Function when order is created
-- Uses x-trigger-source header for origin validation (JWT verification is disabled on webhook)
CREATE OR REPLACE FUNCTION trigger_order_saga()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  request_id BIGINT;
BEGIN
  -- Try standard Supabase setting first (available in hosted Supabase)
  supabase_url := current_setting('supabase.url', true);

  -- Fallback for local development (pg_net runs in Docker, needs host.docker.internal)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'http://host.docker.internal:54321';
  END IF;

  -- Call the saga-webhook Edge Function via pg_net
  -- Using x-trigger-source header to identify request origin
  SELECT net.http_post(
    supabase_url || '/functions/v1/saga-webhook',
    jsonb_build_object(
      'type', 'INSERT',
      'table', 'orders',
      'record', jsonb_build_object(
        'id', NEW.id,
        'warehouse_id', NEW.warehouse_id,
        'customer_id', NEW.customer_id,
        'status', NEW.status,
        'total_amount', NEW.total_amount,
        'notes', NEW.notes,
        'payment_reference', NEW.payment_reference,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      )
    ),
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'x-trigger-source', 'pg_net'
    )
  ) INTO request_id;

  RAISE LOG 'Saga trigger fired for order %, pg_net request_id: %', NEW.id, request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table (only for INSERT)
DROP TRIGGER IF EXISTS on_order_created_saga ON orders;
CREATE TRIGGER on_order_created_saga
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_saga();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION trigger_order_saga() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_order_saga() TO service_role;
