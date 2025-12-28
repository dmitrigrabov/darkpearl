-- Lawns within properties

CREATE TABLE lawns (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Lawn identification
  name VARCHAR(100) NOT NULL,

  -- Lawn characteristics
  area_sqm DECIMAL(10, 2) NOT NULL,
  lawn_condition lawn_condition NOT NULL DEFAULT 'new',

  -- Polygon boundary (array of {latitude, longitude} coordinates)
  boundary JSONB,

  -- Access info for this specific lawn
  access_notes TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lawns_property ON lawns(property_id);
CREATE INDEX idx_lawns_active ON lawns(is_active) WHERE is_active = true;
CREATE INDEX idx_lawns_created_by ON lawns(created_by);

CREATE TRIGGER lawns_updated_at
  BEFORE UPDATE ON lawns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
