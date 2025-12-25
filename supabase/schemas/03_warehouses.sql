-- Warehouses/Locations
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_active ON warehouses(is_active) WHERE is_active = true;

CREATE TRIGGER warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
