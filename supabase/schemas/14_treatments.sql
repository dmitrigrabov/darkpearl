-- Treatment types catalog (services offered)

CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Identification
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Season/timing
  season treatment_season,
  sequence_in_year INTEGER,

  -- Pricing
  price_per_sqm DECIMAL(10, 4) NOT NULL,
  min_price DECIMAL(10, 2) DEFAULT 0,

  -- Time estimation
  minutes_per_100sqm DECIMAL(6, 2) NOT NULL,
  setup_minutes INTEGER DEFAULT 5,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_treatments_code ON treatments(code);
CREATE INDEX idx_treatments_season ON treatments(season);
CREATE INDEX idx_treatments_active ON treatments(is_active) WHERE is_active = true;
CREATE INDEX idx_treatments_created_by ON treatments(created_by);

CREATE TRIGGER treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Links treatments to products (consumables) they require
CREATE TABLE treatment_products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Consumption rate
  quantity_per_100sqm DECIMAL(10, 4) NOT NULL,

  -- Different application rates by condition
  quantity_multiplier_poor DECIMAL(4, 2) DEFAULT 1.2,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(treatment_id, product_id)
);

-- Indexes
CREATE INDEX idx_treatment_products_treatment ON treatment_products(treatment_id);
CREATE INDEX idx_treatment_products_product ON treatment_products(product_id);
