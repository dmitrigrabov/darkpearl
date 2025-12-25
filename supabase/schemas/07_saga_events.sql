-- Saga instances (orchestrator state)
CREATE TABLE sagas (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  saga_type VARCHAR(100) NOT NULL,      -- e.g., 'order_fulfillment'
  correlation_id UUID NOT NULL UNIQUE,   -- Links to order/entity
  status saga_status NOT NULL DEFAULT 'started',
  current_step saga_step_type,
  payload JSONB NOT NULL DEFAULT '{}',   -- Saga context data
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Saga events (event store for saga steps)
CREATE TABLE saga_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  saga_id UUID NOT NULL REFERENCES sagas(id) ON DELETE CASCADE,
  step_type saga_step_type NOT NULL,
  event_type VARCHAR(50) NOT NULL,      -- 'step_started', 'step_completed', 'step_failed', 'compensation_started', etc.
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sagas_correlation ON sagas(correlation_id);
CREATE INDEX idx_sagas_status ON sagas(status);
CREATE INDEX idx_sagas_type ON sagas(saga_type);
CREATE INDEX idx_saga_events_saga ON saga_events(saga_id);
CREATE INDEX idx_saga_events_created ON saga_events(created_at DESC);

CREATE TRIGGER sagas_updated_at
  BEFORE UPDATE ON sagas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
