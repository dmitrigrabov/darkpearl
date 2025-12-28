-- Row Level Security for lawn care domain tables

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawns ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE POLICY "customers_select"
  ON customers FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "customers_insert"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "customers_update"
  ON customers FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "customers_delete"
  ON customers FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- LAWNS
-- ============================================
CREATE POLICY "lawns_select"
  ON lawns FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "lawns_insert"
  ON lawns FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "lawns_update"
  ON lawns FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "lawns_delete"
  ON lawns FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- TREATMENTS (Catalog - read by all, manage by admins)
-- ============================================
CREATE POLICY "treatments_select"
  ON treatments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "treatments_insert"
  ON treatments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "treatments_update"
  ON treatments FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "treatments_delete"
  ON treatments FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- TREATMENT PRODUCTS (Catalog linkage)
-- ============================================
CREATE POLICY "treatment_products_select"
  ON treatment_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "treatment_products_insert"
  ON treatment_products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "treatment_products_delete"
  ON treatment_products FOR DELETE
  TO authenticated
  USING (is_admin_or_manager());

-- ============================================
-- TREATMENT PLANS
-- ============================================
CREATE POLICY "treatment_plans_select"
  ON treatment_plans FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "treatment_plans_insert"
  ON treatment_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "treatment_plans_update"
  ON treatment_plans FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "treatment_plans_delete"
  ON treatment_plans FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- TREATMENT PLAN ITEMS
-- ============================================
CREATE POLICY "treatment_plan_items_select"
  ON treatment_plan_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treatment_plans
      WHERE treatment_plans.id = treatment_plan_items.treatment_plan_id
      AND (treatment_plans.created_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "treatment_plan_items_insert"
  ON treatment_plan_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "treatment_plan_items_update"
  ON treatment_plan_items FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "treatment_plan_items_delete"
  ON treatment_plan_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- OPERATORS
-- ============================================
CREATE POLICY "operators_select"
  ON operators FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
    OR user_id = auth.uid()
  );

CREATE POLICY "operators_insert"
  ON operators FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "operators_update"
  ON operators FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "operators_delete"
  ON operators FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- VEHICLES
-- ============================================
CREATE POLICY "vehicles_select"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "vehicles_insert"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "vehicles_update"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "vehicles_delete"
  ON vehicles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ROUTES
-- ============================================
CREATE POLICY "routes_select"
  ON routes FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = routes.operator_id
      AND operators.user_id = auth.uid()
    )
  );

CREATE POLICY "routes_insert"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "routes_update"
  ON routes FOR UPDATE
  TO authenticated
  USING (
    is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = routes.operator_id
      AND operators.user_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = routes.operator_id
      AND operators.user_id = auth.uid()
    )
  );

CREATE POLICY "routes_delete"
  ON routes FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ROUTE STOPS
-- ============================================
CREATE POLICY "route_stops_select"
  ON route_stops FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_stops.route_id
      AND (
        routes.created_by = auth.uid()
        OR is_admin()
        OR EXISTS (
          SELECT 1 FROM operators
          WHERE operators.id = routes.operator_id
          AND operators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "route_stops_insert"
  ON route_stops FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "route_stops_update"
  ON route_stops FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "route_stops_delete"
  ON route_stops FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- JOBS
-- ============================================
CREATE POLICY "jobs_select"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = jobs.performed_by
      AND operators.user_id = auth.uid()
    )
  );

CREATE POLICY "jobs_insert"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "jobs_update"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = jobs.performed_by
      AND operators.user_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM operators
      WHERE operators.id = jobs.performed_by
      AND operators.user_id = auth.uid()
    )
  );

CREATE POLICY "jobs_delete"
  ON jobs FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- JOB TREATMENTS
-- ============================================
CREATE POLICY "job_treatments_select"
  ON job_treatments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_treatments.job_id
      AND (
        jobs.created_by = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "job_treatments_insert"
  ON job_treatments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "job_treatments_delete"
  ON job_treatments FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- JOB CONSUMPTIONS
-- ============================================
CREATE POLICY "job_consumptions_select"
  ON job_consumptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_consumptions.job_id
      AND (
        jobs.created_by = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "job_consumptions_insert"
  ON job_consumptions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "job_consumptions_delete"
  ON job_consumptions FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- INVOICES
-- ============================================
CREATE POLICY "invoices_select"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "invoices_insert"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "invoices_update"
  ON invoices FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "invoices_delete"
  ON invoices FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- INVOICE ITEMS
-- ============================================
CREATE POLICY "invoice_items_select"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        invoices.created_by = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "invoice_items_insert"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "invoice_items_update"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "invoice_items_delete"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- PAYMENTS
-- ============================================
CREATE POLICY "payments_select"
  ON payments FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "payments_insert"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "payments_update"
  ON payments FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "payments_delete"
  ON payments FOR DELETE
  TO authenticated
  USING (is_admin());
