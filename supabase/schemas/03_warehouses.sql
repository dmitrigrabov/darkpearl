-- Warehouses/Locations (also serves as depots for lawn care operations)
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Depot-specific fields (for lawn care operations)
  is_depot BOOLEAN NOT NULL DEFAULT false,
  postcode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  service_radius_miles DECIMAL(6, 2),

  -- Audit (created_by added via RBAC migration)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_active ON warehouses(is_active) WHERE is_active = true;
CREATE INDEX idx_warehouses_depot ON warehouses(is_depot) WHERE is_depot = true;
CREATE INDEX idx_warehouses_location ON warehouses(latitude, longitude);
-- idx_warehouses_created_by added via RBAC migration

CREATE TRIGGER warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
