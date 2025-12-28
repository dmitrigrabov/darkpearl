-- Properties/lawns belonging to customers

CREATE TABLE lawns (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Location details
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(10) NOT NULL,

  -- Geolocation for routing
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Lawn characteristics
  area_sqm DECIMAL(10, 2) NOT NULL,
  lawn_condition lawn_condition NOT NULL DEFAULT 'new',

  -- Access info for operators
  access_notes TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lawns_customer ON lawns(customer_id);
CREATE INDEX idx_lawns_postcode ON lawns(postcode);
CREATE INDEX idx_lawns_location ON lawns(latitude, longitude);
CREATE INDEX idx_lawns_active ON lawns(is_active) WHERE is_active = true;
CREATE INDEX idx_lawns_created_by ON lawns(created_by);

CREATE TRIGGER lawns_updated_at
  BEFORE UPDATE ON lawns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
