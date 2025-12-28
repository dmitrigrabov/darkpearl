-- Annual treatment plans for lawns

CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  lawn_id UUID NOT NULL REFERENCES lawns(id) ON DELETE CASCADE,

  -- Plan period
  year INTEGER NOT NULL,

  -- Status
  status treatment_plan_status NOT NULL DEFAULT 'active',

  -- Pricing snapshot
  total_estimated_price DECIMAL(12, 2),

  -- Notes
  notes TEXT,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(lawn_id, year)
);

-- Indexes
CREATE INDEX idx_treatment_plans_lawn ON treatment_plans(lawn_id);
CREATE INDEX idx_treatment_plans_year ON treatment_plans(year);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX idx_treatment_plans_created_by ON treatment_plans(created_by);

CREATE TRIGGER treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Individual treatments within a plan
CREATE TABLE treatment_plan_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id),

  -- Scheduling
  scheduled_week DATE,
  window_start DATE,
  window_end DATE,

  -- Pricing at time of plan creation
  price_snapshot DECIMAL(10, 2) NOT NULL,

  -- Status tracking
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_job_id UUID,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_treatment_plan_items_plan ON treatment_plan_items(treatment_plan_id);
CREATE INDEX idx_treatment_plan_items_treatment ON treatment_plan_items(treatment_id);
CREATE INDEX idx_treatment_plan_items_scheduled ON treatment_plan_items(scheduled_week);
CREATE INDEX idx_treatment_plan_items_pending ON treatment_plan_items(is_completed)
  WHERE is_completed = false;

CREATE TRIGGER treatment_plan_items_updated_at
  BEFORE UPDATE ON treatment_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
