-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, service role can write
CREATE POLICY "Products are viewable by anyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products are manageable by service role"
  ON products FOR ALL
  TO service_role
  USING (true);

-- Warehouses: Anyone can read, service role can write
CREATE POLICY "Warehouses are viewable by anyone"
  ON warehouses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Warehouses are manageable by service role"
  ON warehouses FOR ALL
  TO service_role
  USING (true);

-- Inventory: Anyone can read, service role manages
CREATE POLICY "Inventory is viewable by anyone"
  ON inventory FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Inventory is manageable by service role"
  ON inventory FOR ALL
  TO service_role
  USING (true);

-- Stock movements: Anyone can read, service role writes
CREATE POLICY "Movements are viewable by anyone"
  ON stock_movements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Movements are manageable by service role"
  ON stock_movements FOR ALL
  TO service_role
  USING (true);

-- Orders: Anyone can read for PoC, service role manages
CREATE POLICY "Orders are viewable by anyone"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Orders are insertable by anyone"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Orders are manageable by service role"
  ON orders FOR ALL
  TO service_role
  USING (true);

-- Order items: Anyone can read for PoC
CREATE POLICY "Order items are viewable by anyone"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Order items are insertable by anyone"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Order items are manageable by service role"
  ON order_items FOR ALL
  TO service_role
  USING (true);

-- Sagas and events: Service role only
CREATE POLICY "Sagas are manageable by service role"
  ON sagas FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Saga events are manageable by service role"
  ON saga_events FOR ALL
  TO service_role
  USING (true);

-- Outbox: Service role only
CREATE POLICY "Outbox is manageable by service role"
  ON outbox FOR ALL
  TO service_role
  USING (true);
