-- Seed data for DarkPearl Stock Management
-- Run with: supabase db reset

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE saga_events CASCADE;
TRUNCATE TABLE sagas CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE warehouses CASCADE;

-- Insert warehouses (using valid UUID v4 format)
INSERT INTO warehouses (id, code, name, address, is_active) VALUES
  ('11111111-1111-4111-a111-111111111111', 'WH-MAIN', 'Main Warehouse', '123 Industrial Park, City A', true),
  ('22222222-2222-4222-a222-222222222222', 'WH-EAST', 'East Distribution Center', '456 Commerce Drive, City B', true),
  ('33333333-3333-4333-a333-333333333333', 'WH-WEST', 'West Fulfillment Hub', '789 Logistics Way, City C', true);

-- Insert products (using valid UUID v4 format)
INSERT INTO products (id, sku, name, description, unit_price, is_active) VALUES
  ('aaaa1111-1111-4111-a111-111111111111', 'LAPTOP-001', 'Business Laptop Pro', '15.6" laptop with 16GB RAM, 512GB SSD', 999.99, true),
  ('aaaa2222-2222-4222-a222-222222222222', 'LAPTOP-002', 'Developer Laptop Ultra', '17" laptop with 32GB RAM, 1TB SSD', 1499.99, true),
  ('bbbb1111-1111-4111-a111-111111111111', 'MONITOR-001', '27" 4K Monitor', 'Professional grade 4K display', 449.99, true),
  ('bbbb2222-2222-4222-a222-222222222222', 'MONITOR-002', '32" Curved Monitor', 'Ultra-wide curved display', 599.99, true),
  ('cccc1111-1111-4111-a111-111111111111', 'KEYBOARD-001', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 129.99, true),
  ('cccc2222-2222-4222-a222-222222222222', 'MOUSE-001', 'Ergonomic Mouse', 'Wireless ergonomic mouse', 79.99, true),
  ('dddd1111-1111-4111-a111-111111111111', 'HEADSET-001', 'Noise Canceling Headset', 'Bluetooth headset with ANC', 199.99, true),
  ('dddd2222-2222-4222-a222-222222222222', 'WEBCAM-001', '4K Webcam', 'Professional streaming webcam', 149.99, true),
  ('eeee1111-1111-4111-a111-111111111111', 'DOCK-001', 'USB-C Docking Station', 'Multi-port USB-C dock', 249.99, true),
  ('eeee2222-2222-4222-a222-222222222222', 'CHARGER-001', 'Fast Charger 100W', 'GaN USB-C fast charger', 69.99, true);

-- Insert inventory for Main Warehouse (good stock levels)
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved, reorder_point, reorder_quantity) VALUES
  ('aaaa1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 50, 0, 10, 25),
  ('aaaa2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 30, 0, 5, 15),
  ('bbbb1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 75, 0, 15, 30),
  ('bbbb2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 40, 0, 10, 20),
  ('cccc1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 100, 0, 20, 50),
  ('cccc2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 150, 0, 30, 75),
  ('dddd1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 60, 0, 15, 30),
  ('dddd2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 80, 0, 20, 40),
  ('eeee1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 45, 0, 10, 25),
  ('eeee2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 200, 0, 50, 100);

-- Insert inventory for East Warehouse (medium stock levels)
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved, reorder_point, reorder_quantity) VALUES
  ('aaaa1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 25, 0, 10, 25),
  ('aaaa2222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222', 15, 0, 5, 15),
  ('bbbb1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 35, 0, 15, 30),
  ('cccc1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 50, 0, 20, 50),
  ('dddd1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 30, 0, 15, 30);

-- Insert inventory for West Warehouse (some low stock for testing)
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved, reorder_point, reorder_quantity) VALUES
  ('aaaa1111-1111-4111-a111-111111111111', '33333333-3333-4333-a333-333333333333', 8, 0, 10, 25),  -- Low stock!
  ('bbbb1111-1111-4111-a111-111111111111', '33333333-3333-4333-a333-333333333333', 5, 0, 15, 30),  -- Low stock!
  ('cccc2222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 75, 0, 30, 75),
  ('eeee2222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 100, 0, 50, 100);

-- Insert some initial stock movements (receive operations)
INSERT INTO stock_movements (correlation_id, product_id, warehouse_id, movement_type, quantity, reference_type, notes) VALUES
  (extensions.uuid_generate_v4(), 'aaaa1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 50, 'initial_stock', 'Initial stock setup'),
  (extensions.uuid_generate_v4(), 'aaaa2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 'receive', 30, 'initial_stock', 'Initial stock setup'),
  (extensions.uuid_generate_v4(), 'bbbb1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 75, 'initial_stock', 'Initial stock setup'),
  (extensions.uuid_generate_v4(), 'cccc1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 100, 'initial_stock', 'Initial stock setup'),
  (extensions.uuid_generate_v4(), 'dddd1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 60, 'initial_stock', 'Initial stock setup');

-- Summary
DO $$
BEGIN
  RAISE NOTICE 'Seed data loaded successfully!';
  RAISE NOTICE 'Warehouses: 3';
  RAISE NOTICE 'Products: 10';
  RAISE NOTICE 'Inventory records: 19';
  RAISE NOTICE 'Stock movements: 5';
END $$;
