-- Actual work performed at a lawn

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- References
  lawn_id UUID NOT NULL REFERENCES lawns(id),
  route_stop_id UUID REFERENCES route_stops(id),
  treatment_plan_item_id UUID REFERENCES treatment_plan_items(id),

  -- Job details
  job_number VARCHAR(20) NOT NULL UNIQUE,
  status job_status NOT NULL DEFAULT 'scheduled',

  -- Timing
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Operator who performed
  performed_by UUID REFERENCES operators(id),

  -- Lawn snapshot at time of job
  lawn_area_sqm DECIMAL(10, 2) NOT NULL,
  lawn_condition_at_job lawn_condition,

  -- Operator notes
  before_notes TEXT,
  after_notes TEXT,
  customer_signature_url TEXT,

  -- Photos (stored as URLs)
  before_photos JSONB DEFAULT '[]',
  after_photos JSONB DEFAULT '[]',

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_lawn ON jobs(lawn_id);
CREATE INDEX idx_jobs_route_stop ON jobs(route_stop_id);
CREATE INDEX idx_jobs_treatment_plan_item ON jobs(treatment_plan_item_id);
CREATE INDEX idx_jobs_number ON jobs(job_number);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_performer ON jobs(performed_by);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);

-- Auto-generate job number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num
  FROM jobs
  WHERE DATE(created_at) = DATE(NOW());

  NEW.job_number := 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_generate_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL)
  EXECUTE FUNCTION generate_job_number();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key from route_stops to jobs (deferred to avoid circular dependency)
ALTER TABLE route_stops
  ADD CONSTRAINT fk_route_stops_job
  FOREIGN KEY (job_id) REFERENCES jobs(id);

-- Add foreign key from treatment_plan_items to jobs (deferred)
ALTER TABLE treatment_plan_items
  ADD CONSTRAINT fk_treatment_plan_items_job
  FOREIGN KEY (completed_job_id) REFERENCES jobs(id);

-- Treatments performed within a job
CREATE TABLE job_treatments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id),

  -- Pricing at time of job
  price_charged DECIMAL(10, 2) NOT NULL,

  -- Time tracking
  duration_minutes INTEGER,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_treatments_job ON job_treatments(job_id);
CREATE INDEX idx_job_treatments_treatment ON job_treatments(treatment_id);

-- Products consumed during a job
CREATE TABLE job_consumptions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_treatment_id UUID NOT NULL REFERENCES job_treatments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),

  -- Quantity consumed
  quantity_consumed DECIMAL(10, 4) NOT NULL,

  -- Link to stock movement (created when job completed)
  stock_movement_id UUID REFERENCES stock_movements(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_consumptions_job ON job_consumptions(job_id);
CREATE INDEX idx_job_consumptions_treatment ON job_consumptions(job_treatment_id);
CREATE INDEX idx_job_consumptions_product ON job_consumptions(product_id);
CREATE INDEX idx_job_consumptions_movement ON job_consumptions(stock_movement_id);
