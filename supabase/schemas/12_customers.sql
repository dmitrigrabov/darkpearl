-- Customers who own lawns

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Auto-generated customer number
  customer_number VARCHAR(20) NOT NULL UNIQUE,

  -- Personal info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_secondary VARCHAR(20),

  -- Billing address (may differ from lawn address)
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_postcode VARCHAR(10),

  -- Account status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Preferences
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_postcode ON customers(billing_postcode);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;
CREATE INDEX idx_customers_name ON customers(last_name, first_name);
CREATE INDEX idx_customers_created_by ON customers(created_by);

-- Auto-generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM 4) AS INTEGER)), 10000) + 1
  INTO next_num
  FROM customers
  WHERE customer_number LIKE 'GM-%';

  NEW.customer_number := 'GM-' || next_num::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_generate_number
  BEFORE INSERT ON customers
  FOR EACH ROW
  WHEN (NEW.customer_number IS NULL)
  EXECUTE FUNCTION generate_customer_number();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
