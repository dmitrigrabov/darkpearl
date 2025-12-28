-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update any profile (role changes)
CREATE POLICY "Admins can manage profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- PRODUCTS
-- Admins: full access
-- Managers: can create/update own
-- Viewers: read own only
-- ============================================
CREATE POLICY "products_select"
  ON products FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL  -- Legacy data without owner
  );

CREATE POLICY "products_insert"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "products_update"
  ON products FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "products_delete"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- WAREHOUSES
-- Admins: full access
-- Managers: can create/update own
-- Viewers: read own only
-- ============================================
CREATE POLICY "warehouses_select"
  ON warehouses FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "warehouses_insert"
  ON warehouses FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "warehouses_update"
  ON warehouses FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "warehouses_delete"
  ON warehouses FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- INVENTORY
-- Admins: full access
-- Managers: can manage inventory
-- Viewers: read own only
-- ============================================
CREATE POLICY "inventory_select"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "inventory_insert"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "inventory_update"
  ON inventory FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

CREATE POLICY "inventory_delete"
  ON inventory FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- STOCK MOVEMENTS
-- Admins: full access
-- Managers: can create movements
-- Viewers: read own only
-- ============================================
CREATE POLICY "stock_movements_select"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "stock_movements_insert"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

-- Stock movements are immutable (audit trail)
-- No update or delete policies for non-admins

CREATE POLICY "stock_movements_delete"
  ON stock_movements FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ORDERS
-- Admins: full access
-- Managers: can create/update own
-- Viewers: read own only
-- ============================================
CREATE POLICY "orders_select"
  ON orders FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "orders_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "orders_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "orders_delete"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ORDER ITEMS
-- Follow parent order ownership
-- ============================================
CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.created_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_items_insert"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_or_manager()
    AND (created_by IS NULL OR created_by = auth.uid())
  );

CREATE POLICY "order_items_update"
  ON order_items FOR UPDATE
  TO authenticated
  USING (owns_or_is_admin(created_by))
  WITH CHECK (owns_or_is_admin(created_by));

CREATE POLICY "order_items_delete"
  ON order_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- SAGAS AND EVENTS
-- Service role only (internal system operations)
-- ============================================
CREATE POLICY "Sagas are manageable by service role"
  ON sagas FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Saga events are manageable by service role"
  ON saga_events FOR ALL
  TO service_role
  USING (true);
