-- Stock movements (full audit trail)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  correlation_id UUID NOT NULL,  -- For idempotency and saga tracking
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id UUID,            -- Order ID, transfer ID, etc.
  reference_type VARCHAR(50),   -- 'order', 'transfer', 'adjustment'
  notes TEXT,
  created_by UUID,              -- User ID from auth
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for movement queries
CREATE INDEX idx_movements_correlation ON stock_movements(correlation_id);
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_movements_reference ON stock_movements(reference_id, reference_type);
CREATE INDEX idx_movements_created_at ON stock_movements(created_at DESC);

-- Idempotency: Prevent duplicate movements with same correlation_id and type
CREATE UNIQUE INDEX idx_movements_idempotent
  ON stock_movements(correlation_id, movement_type, product_id, warehouse_id);
