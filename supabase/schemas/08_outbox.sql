-- Outbox pattern for reliable event publishing
CREATE TABLE outbox (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,  -- 'order', 'saga', etc.
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_outbox_unprocessed ON outbox(id)
  WHERE processed_at IS NULL;
CREATE INDEX idx_outbox_aggregate ON outbox(aggregate_type, aggregate_id);

-- Function to add outbox event (called within transactions)
CREATE OR REPLACE FUNCTION add_outbox_event(
  p_event_type VARCHAR(100),
  p_aggregate_type VARCHAR(100),
  p_aggregate_id UUID,
  p_payload JSONB
) RETURNS BIGINT AS $$
DECLARE
  event_id BIGINT;
BEGIN
  INSERT INTO outbox (event_type, aggregate_type, aggregate_id, payload)
  VALUES (p_event_type, p_aggregate_type, p_aggregate_id, p_payload)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;
