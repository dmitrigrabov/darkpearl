-- Drop outbox table and related function
-- The outbox pattern has been replaced by trigger.dev + pg_net

-- Drop RLS policy first
DROP POLICY IF EXISTS "Outbox is manageable by service role" ON outbox;

-- Drop the function
DROP FUNCTION IF EXISTS add_outbox_event;

-- Drop the table
DROP TABLE IF EXISTS outbox;
