-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_events ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, authenticated users can manage
CREATE POLICY "Products are viewable by anyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products are manageable by authenticated users"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Warehouses: Anyone can read, authenticated users can manage
CREATE POLICY "Warehouses are viewable by anyone"
  ON warehouses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Warehouses are manageable by authenticated users"
  ON warehouses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inventory: Anyone can read, authenticated users can manage
CREATE POLICY "Inventory is viewable by anyone"
  ON inventory FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Inventory is manageable by authenticated users"
  ON inventory FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stock movements: Anyone can read, authenticated users can manage
CREATE POLICY "Movements are viewable by anyone"
  ON stock_movements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Movements are manageable by authenticated users"
  ON stock_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: Anyone can read, authenticated users can manage
CREATE POLICY "Orders are viewable by anyone"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Orders are manageable by authenticated users"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items: Anyone can read, authenticated users can manage
CREATE POLICY "Order items are viewable by anyone"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Order items are manageable by authenticated users"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sagas and events: Service role only (internal system operations)
CREATE POLICY "Sagas are manageable by service role"
  ON sagas FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Saga events are manageable by service role"
  ON saga_events FOR ALL
  TO service_role
  USING (true);
