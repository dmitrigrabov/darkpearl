-- Company vehicles

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  depot_id UUID NOT NULL REFERENCES warehouses(id),

  -- Vehicle details
  registration VARCHAR(15) NOT NULL UNIQUE,
  make VARCHAR(50),
  vehicle_model VARCHAR(50),

  -- Costs
  cost_per_mile DECIMAL(6, 4),

  -- Capacity
  load_capacity_kg DECIMAL(8, 2),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vehicles_depot ON vehicles(depot_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration);
CREATE INDEX idx_vehicles_active ON vehicles(is_active) WHERE is_active = true;
CREATE INDEX idx_vehicles_created_by ON vehicles(created_by);

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
