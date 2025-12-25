-- Inventory (stock levels per product per warehouse)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  reorder_point INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

-- Indexes for inventory lookups
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_low_stock ON inventory(product_id, warehouse_id)
  WHERE quantity_available <= reorder_point;

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if stock is available
CREATE OR REPLACE FUNCTION check_stock_availability(
  p_product_id UUID,
  p_warehouse_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
BEGIN
  SELECT quantity_available - quantity_reserved INTO available
  FROM inventory
  WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;

  RETURN COALESCE(available, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;
