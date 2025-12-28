-- Technicians who perform treatments

CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  depot_id UUID NOT NULL REFERENCES warehouses(id),

  -- Personal info
  employee_number VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,

  -- Employment details
  hourly_cost DECIMAL(8, 2) NOT NULL,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operators_depot ON operators(depot_id);
CREATE INDEX idx_operators_employee_number ON operators(employee_number);
CREATE INDEX idx_operators_user ON operators(user_id);
CREATE INDEX idx_operators_active ON operators(is_active) WHERE is_active = true;
CREATE INDEX idx_operators_created_by ON operators(created_by);

-- Auto-generate employee number
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM operators
  WHERE employee_number LIKE 'OP-%';

  NEW.employee_number := 'OP-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operators_generate_number
  BEFORE INSERT ON operators
  FOR EACH ROW
  WHEN (NEW.employee_number IS NULL)
  EXECUTE FUNCTION generate_employee_number();

CREATE TRIGGER operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
