-- Seed data for DarkPearl Lawn Care Management
-- Based on research from Green Man Lawn Care, GreenThumb, TruGreen, and Kingsbury Lawn Care
-- Run with: supabase db reset

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE saga_events CASCADE;
TRUNCATE TABLE sagas CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE invoice_items CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE job_consumptions CASCADE;
TRUNCATE TABLE job_treatments CASCADE;
TRUNCATE TABLE jobs CASCADE;
TRUNCATE TABLE route_stops CASCADE;
TRUNCATE TABLE routes CASCADE;
TRUNCATE TABLE treatment_plan_items CASCADE;
TRUNCATE TABLE treatment_plans CASCADE;
TRUNCATE TABLE treatment_products CASCADE;
TRUNCATE TABLE treatments CASCADE;
TRUNCATE TABLE vehicles CASCADE;
TRUNCATE TABLE operators CASCADE;
TRUNCATE TABLE lawns CASCADE;
TRUNCATE TABLE properties CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE inventory CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE warehouses CASCADE;

-- ============================================================================
-- DEPOTS (Warehouses)
-- Based on lawn care service areas - West Midlands focus
-- ============================================================================
INSERT INTO warehouses (id, code, name, address, is_active) VALUES
  ('11111111-1111-4111-a111-111111111111', 'DEPOT-MAIN', 'Sutton Coldfield Depot', 'Unit 4, Minworth Industrial Estate, Minworth, Birmingham B76 1AH', true),
  ('22222222-2222-4222-a222-222222222222', 'DEPOT-WARWICK', 'Warwick Depot', 'Unit 12, Warwick Technology Park, Gallows Hill, Warwick CV34 6UW', true),
  ('33333333-3333-4333-a333-333333333333', 'DEPOT-STAFFORD', 'Stafford Depot', 'Unit 8, Riverside Business Park, Stafford ST16 3TW', true);

-- ============================================================================
-- LAWN CARE PRODUCTS
-- Professional-grade fertilisers, herbicides, and treatments
-- Pricing based on bulk trade prices
-- ============================================================================
INSERT INTO products (id, sku, name, description, unit_price, is_active) VALUES
  -- Seasonal Fertilisers (25kg bags)
  ('aaaa1111-1111-4111-a111-111111111111', 'FERT-SPRING', 'NutraGreen Spring Ready', 'NPK 12-3-5 + 2% Fe + Seaweed. Professional spring fertiliser for vigorous growth. 25kg bag treats up to 625m².', 42.50, true),
  ('aaaa2222-2222-4222-a222-222222222222', 'FERT-SUMMER', 'NutraGreen Summer Long', 'NPK 10-4-4 slow release summer fertiliser. Maintains green colour during dry periods. 25kg bag.', 48.75, true),
  ('aaaa3333-3333-4333-a333-333333333333', 'FERT-AUTUMN', 'NutraGreen Autumn/Winter', 'NPK 6-5-10 + 3% Fe high potassium formula for winter hardiness. 25kg bag.', 45.00, true),

  -- Moss and Weed Control
  ('bbbb1111-1111-4111-a111-111111111111', 'MOSS-CTRL', 'FerroMoss Iron Sulphate', 'Ferrous sulphate 20% Fe for moss control and lawn greening. 25kg bag.', 28.50, true),
  ('bbbb2222-2222-4222-a222-222222222222', 'WEED-SEL', 'ProTurf Selective Herbicide', 'Professional selective herbicide for broadleaf weed control. 5L concentrate.', 89.00, true),
  ('bbbb3333-3333-4333-a333-333333333333', 'WEED-SPOT', 'SpotKill Weed Treatment', 'Ready-to-use spot treatment for stubborn weeds. 1L trigger spray.', 12.50, true),

  -- Pest Control - Biological
  ('cccc1111-1111-4111-a111-111111111111', 'PEST-LEATHER', 'Nemasys Leatherjacket Killer', 'Steinernema feltiae nematodes for leatherjacket control. Treats 100m².', 34.95, true),
  ('cccc2222-2222-4222-a222-222222222222', 'PEST-CHAFER', 'Nemasys Chafer Grub Killer', 'Heterorhabditis bacteriophora nematodes for chafer grub control. Treats 100m².', 42.50, true),

  -- Disease Treatment
  ('cccc3333-3333-4333-a333-333333333333', 'DISEASE-FUNG', 'Turf Fungicide Concentrate', 'Systemic fungicide for red thread, fusarium, and rust. 1L concentrate.', 125.00, true),

  -- Lawn Renovation
  ('dddd1111-1111-4111-a111-111111111111', 'SEED-PREM', 'Premium Lawn Seed Mix', 'Perennial ryegrass, fescue, and bent grass blend. 10kg bag covers 400m².', 85.00, true),
  ('dddd2222-2222-4222-a222-222222222222', 'SEED-SHADE', 'Shade Tolerant Seed Mix', 'Fine fescue blend for shaded areas. 10kg bag.', 95.00, true),
  ('dddd3333-3333-4333-a333-333333333333', 'TOP-DRESS', 'Premium Top Dressing', '70/30 sand/loam blend. 25kg bag.', 8.50, true),

  -- Soil Improvers
  ('eeee1111-1111-4111-a111-111111111111', 'SOIL-IMP', 'Soil Conditioner Plus', 'Organic matter with beneficial bacteria. 25kg bag.', 22.00, true),
  ('eeee2222-2222-4222-a222-222222222222', 'WETTING-AGT', 'AquaSoak Wetting Agent', 'Improves water penetration in hydrophobic soils. 5L concentrate.', 65.00, true),

  -- Equipment consumables
  ('ffff1111-1111-4111-a111-111111111111', 'SPRAY-MARK', 'Turf Marking Dye', 'Blue spray indicator for even application. 1L.', 18.00, true);

-- ============================================================================
-- TREATMENTS (Services Offered)
-- Based on GreenThumb/TruGreen seasonal programme structure
-- Pricing per sqm based on market research: ~£0.21-0.45/sqm
-- ============================================================================
INSERT INTO treatments (id, code, name, description, season, sequence_in_year, price_per_sqm, min_price, minutes_per_100sqm, setup_minutes, is_active) VALUES
  -- Core Seasonal Treatments (Basic Programme)
  ('00011111-1111-4111-a111-111111111111', 'SPRING-FEED', 'Spring Feed & Weed', 'Spring fertiliser application with selective weed treatment. Promotes strong early growth.', 'spring_early', 1, 0.22, 28.00, 8, 5, true),
  ('00022222-2222-4222-a222-222222222222', 'EARLY-SUMMER', 'Early Summer Feed', 'Balanced summer fertiliser to maintain healthy growth. Includes weed spot treatment.', 'spring_late', 2, 0.20, 26.00, 7, 5, true),
  ('00033333-3333-4333-a333-333333333333', 'SUMMER-FEED', 'Summer Feed & Moss', 'Slow-release summer feed with moss suppressant. Maintains green colour.', 'summer', 3, 0.22, 28.00, 8, 5, true),
  ('00044444-4444-4444-a444-444444444444', 'LATE-SUMMER', 'Late Summer Treatment', 'Prepares lawn for autumn with targeted weed control and light feed.', 'autumn_early', 4, 0.20, 26.00, 7, 5, true),
  ('00055555-5555-4555-a555-555555555555', 'AUTUMN-FEED', 'Autumn/Winter Feed', 'High potassium feed for winter hardiness. Deep iron for moss prevention.', 'autumn_late', 5, 0.24, 30.00, 8, 5, true),

  -- Additional Treatments (Standard/Ultimate Programmes)
  ('00066666-6666-4666-a666-666666666666', 'SCARIFY', 'Lawn Scarification', 'Mechanical removal of thatch and moss debris. Essential for lawn health.', NULL, NULL, 0.45, 65.00, 25, 10, true),
  ('00077777-7777-4777-a777-777777777777', 'AERATE', 'Hollow Tine Aeration', 'Core aeration to relieve compaction and improve drainage.', NULL, NULL, 0.38, 55.00, 20, 10, true),
  ('00088888-8888-4888-a888-888888888888', 'OVERSEED', 'Overseeding Treatment', 'Premium seed application to thicken lawn and fill bare patches.', NULL, NULL, 0.35, 45.00, 15, 5, true),
  ('00099999-9999-4999-a999-999999999999', 'TOP-DRESS', 'Top Dressing', 'Fine sand/loam dressing to level lawn and improve soil structure.', NULL, NULL, 0.55, 75.00, 30, 10, true),

  -- Problem Treatments
  ('000aaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'LEATHER-TRT', 'Leatherjacket Treatment', 'Nematode biological control for leatherjacket larvae. Best applied late summer.', 'autumn_early', NULL, 0.40, 55.00, 12, 5, true),
  ('000bbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'CHAFER-TRT', 'Chafer Grub Treatment', 'Nematode biological control for chafer grub larvae. Apply July-October.', 'summer', NULL, 0.48, 65.00, 12, 5, true),
  ('000ccccc-cccc-4ccc-cccc-cccccccccccc', 'DISEASE-TRT', 'Disease Treatment', 'Fungicide treatment for red thread, fusarium, and other lawn diseases.', NULL, NULL, 0.35, 45.00, 10, 5, true),
  ('000ddddd-dddd-4ddd-dddd-dddddddddddd', 'MOSS-HEAVY', 'Heavy Moss Treatment', 'Intensive iron treatment for severe moss infestation.', 'spring_early', NULL, 0.30, 38.00, 10, 5, true);

-- ============================================================================
-- TREATMENT PRODUCTS (Links treatments to required products)
-- Consumption rates per 100sqm based on manufacturer specifications
-- ============================================================================
INSERT INTO treatment_products (treatment_id, product_id, quantity_per_100sqm, quantity_multiplier_poor) VALUES
  -- Spring Feed & Weed
  ('00011111-1111-4111-a111-111111111111', 'aaaa1111-1111-4111-a111-111111111111', 4.0, 1.2),  -- 4kg spring fertiliser per 100sqm
  ('00011111-1111-4111-a111-111111111111', 'bbbb2222-2222-4222-a222-222222222222', 0.05, 1.3), -- 50ml herbicide per 100sqm

  -- Early Summer Feed
  ('00022222-2222-4222-a222-222222222222', 'aaaa2222-2222-4222-a222-222222222222', 3.5, 1.2),  -- 3.5kg summer feed
  ('00022222-2222-4222-a222-222222222222', 'bbbb3333-3333-4333-a333-333333333333', 0.02, 1.0), -- Spot treatment as needed

  -- Summer Feed & Moss
  ('00033333-3333-4333-a333-333333333333', 'aaaa2222-2222-4222-a222-222222222222', 3.5, 1.2),
  ('00033333-3333-4333-a333-333333333333', 'bbbb1111-1111-4111-a111-111111111111', 2.0, 1.5),  -- 2kg iron sulphate

  -- Late Summer Treatment
  ('00044444-4444-4444-a444-444444444444', 'aaaa2222-2222-4222-a222-222222222222', 2.5, 1.2),
  ('00044444-4444-4444-a444-444444444444', 'bbbb2222-2222-4222-a222-222222222222', 0.04, 1.2),

  -- Autumn/Winter Feed
  ('00055555-5555-4555-a555-555555555555', 'aaaa3333-3333-4333-a333-333333333333', 4.0, 1.2),
  ('00055555-5555-4555-a555-555555555555', 'bbbb1111-1111-4111-a111-111111111111', 1.5, 1.5),

  -- Scarification (no products, just service)

  -- Aeration (no products, just service)

  -- Overseeding
  ('00088888-8888-4888-a888-888888888888', 'dddd1111-1111-4111-a111-111111111111', 2.5, 1.3),  -- 2.5kg seed per 100sqm

  -- Top Dressing
  ('00099999-9999-4999-a999-999999999999', 'dddd3333-3333-4333-a333-333333333333', 20.0, 1.2), -- 20kg dressing per 100sqm

  -- Leatherjacket Treatment
  ('000aaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'cccc1111-1111-4111-a111-111111111111', 1.0, 1.0),  -- 1 pack per 100sqm

  -- Chafer Grub Treatment
  ('000bbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'cccc2222-2222-4222-a222-222222222222', 1.0, 1.0),

  -- Disease Treatment
  ('000ccccc-cccc-4ccc-cccc-cccccccccccc', 'cccc3333-3333-4333-a333-333333333333', 0.1, 1.5),  -- 100ml per 100sqm

  -- Heavy Moss Treatment
  ('000ddddd-dddd-4ddd-dddd-dddddddddddd', 'bbbb1111-1111-4111-a111-111111111111', 5.0, 1.3);  -- Heavy dose

-- ============================================================================
-- INVENTORY (Stock levels at each depot)
-- Realistic starting stock based on typical lawn care operation
-- ============================================================================
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved, reorder_point, reorder_quantity) VALUES
  -- Sutton Coldfield Depot (Main - largest stock)
  ('aaaa1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 48, 0, 12, 24),   -- 48 bags spring fert
  ('aaaa2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 36, 0, 10, 20),   -- 36 bags summer fert
  ('aaaa3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 24, 0, 8, 16),    -- 24 bags autumn fert
  ('bbbb1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 30, 0, 10, 20),   -- Iron sulphate
  ('bbbb2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 12, 0, 4, 8),     -- Herbicide
  ('bbbb3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 24, 0, 8, 16),    -- Spot weed
  ('cccc1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 15, 0, 5, 10),    -- Leatherjacket nematodes
  ('cccc2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 12, 0, 4, 8),     -- Chafer nematodes
  ('cccc3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 6, 0, 2, 4),      -- Fungicide
  ('dddd1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 20, 0, 6, 12),    -- Lawn seed
  ('dddd2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 8, 0, 3, 6),      -- Shade seed
  ('dddd3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 60, 0, 20, 40),   -- Top dressing
  ('eeee1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 15, 0, 5, 10),    -- Soil conditioner
  ('eeee2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 8, 0, 3, 6),      -- Wetting agent
  ('ffff1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 10, 0, 4, 8),     -- Marking dye

  -- Warwick Depot (Medium stock)
  ('aaaa1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 24, 0, 8, 16),
  ('aaaa2222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222', 18, 0, 6, 12),
  ('aaaa3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', 12, 0, 4, 8),
  ('bbbb1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 15, 0, 5, 10),
  ('bbbb2222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222', 6, 0, 2, 4),
  ('cccc1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 8, 0, 3, 6),
  ('dddd1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 10, 0, 4, 8),
  ('dddd3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', 30, 0, 10, 20),

  -- Stafford Depot (Smaller stock, some items low)
  ('aaaa1111-1111-4111-a111-111111111111', '33333333-3333-4333-a333-333333333333', 12, 0, 6, 12),
  ('aaaa2222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 8, 0, 4, 8),
  ('aaaa3333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333', 5, 0, 4, 8),     -- Low stock!
  ('bbbb1111-1111-4111-a111-111111111111', '33333333-3333-4333-a333-333333333333', 8, 0, 4, 8),
  ('bbbb2222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 3, 0, 2, 4),     -- Low stock!
  ('dddd3333-3333-4333-a333-333333333333', '33333333-3333-4333-a333-333333333333', 20, 0, 8, 16);

-- ============================================================================
-- OPERATORS (Lawn Care Technicians)
-- Realistic UK names, hourly costs based on lawn care industry (£12-18/hr)
-- ============================================================================
INSERT INTO operators (id, employee_number, depot_id, first_name, last_name, email, phone, hourly_cost, is_active) VALUES
  ('0e001111-1111-4111-a111-111111111111', 'OP-001', '11111111-1111-4111-a111-111111111111', 'James', 'Mitchell', 'james.mitchell@greenman.co.uk', '07712 345678', 15.50, true),
  ('0e002222-2222-4222-a222-222222222222', 'OP-002', '11111111-1111-4111-a111-111111111111', 'Daniel', 'Thompson', 'daniel.thompson@greenman.co.uk', '07723 456789', 14.00, true),
  ('0e003333-3333-4333-a333-333333333333', 'OP-003', '22222222-2222-4222-a222-222222222222', 'Michael', 'Roberts', 'michael.roberts@greenman.co.uk', '07734 567890', 15.00, true),
  ('0e004444-4444-4444-a444-444444444444', 'OP-004', '22222222-2222-4222-a222-222222222222', 'Christopher', 'Walker', 'chris.walker@greenman.co.uk', '07745 678901', 13.50, true),
  ('0e005555-5555-4555-a555-555555555555', 'OP-005', '33333333-3333-4333-a333-333333333333', 'Thomas', 'Harrison', 'tom.harrison@greenman.co.uk', '07756 789012', 14.50, true),
  ('0e006666-6666-4666-a666-666666666666', 'OP-006', '11111111-1111-4111-a111-111111111111', 'William', 'Clarke', 'william.clarke@greenman.co.uk', '07767 890123', 16.00, true);

-- ============================================================================
-- VEHICLES
-- Typical lawn care company vehicles - Ford Transit Custom, Vauxhall Vivaro
-- UK registration format, realistic costs per mile (£0.45-0.55)
-- ============================================================================
INSERT INTO vehicles (id, depot_id, registration, make, vehicle_model, cost_per_mile, load_capacity_kg, is_active) VALUES
  ('0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'BT73 GMC', 'Ford', 'Transit Custom 300', 0.48, 1000, true),
  ('0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 'BV72 LWN', 'Vauxhall', 'Vivaro 2700', 0.45, 950, true),
  ('0e0a3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', 'WK71 TRF', 'Ford', 'Transit Custom 280', 0.50, 900, true),
  ('0e0a4444-4444-4444-a444-444444444444', '22222222-2222-4222-a222-222222222222', 'WK23 GRN', 'Citroen', 'Dispatch M', 0.46, 850, true),
  ('0e0a5555-5555-4555-a555-555555555555', '33333333-3333-4333-a333-333333333333', 'ST72 LAW', 'Vauxhall', 'Combo Cargo', 0.42, 750, true);

-- ============================================================================
-- CUSTOMERS
-- Realistic UK customers in West Midlands area
-- Mix of billing addresses matching or different from lawn addresses
-- ============================================================================
INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, phone_secondary, billing_address_line1, billing_address_line2, billing_city, billing_postcode, is_active, preferred_contact_method, marketing_consent, notes) VALUES
  ('c0501111-1111-4111-a111-111111111111', 'GM-10001', 'Richard', 'Pemberton', 'r.pemberton@btinternet.com', '0121 354 2847', '07891 234567', '42 Walmley Road', NULL, 'Sutton Coldfield', 'B76 1QN', true, 'email', true, 'Long-term customer since 2019. Prefers morning appointments.'),
  ('c0502222-2222-4222-a222-222222222222', 'GM-10002', 'Patricia', 'Thornton', 'pat.thornton@gmail.com', '0121 378 9012', NULL, '18 Rectory Road', NULL, 'Sutton Coldfield', 'B75 7RJ', true, 'phone', false, 'Gate code: 4521'),
  ('c0503333-3333-4333-a333-333333333333', 'GM-10003', 'Geoffrey', 'Whitehouse', 'gwhitehouse@yahoo.co.uk', '01926 432187', '07923 456789', '7 Milverton Crescent', NULL, 'Leamington Spa', 'CV32 5QR', true, 'email', true, NULL),
  ('c0504444-4444-4444-a444-444444444444', 'GM-10004', 'Margaret', 'Sullivan', 'margaret.s@outlook.com', '01926 887234', NULL, '23 Kenilworth Road', NULL, 'Leamington Spa', 'CV32 6JT', true, 'email', false, 'Elderly customer - needs advance notice for visits.'),
  ('c0505555-5555-4555-a555-555555555555', 'GM-10005', 'Andrew', 'Blackwell', 'a.blackwell@hotmail.co.uk', '01827 712345', '07812 345678', '156 Coleshill Road', NULL, 'Curdworth', 'B76 9HG', true, 'email', true, 'Business owner - flexible schedule.'),
  ('c0506666-6666-4666-a666-666666666666', 'GM-10006', 'Susan', 'Crawford', 's.crawford@gmail.com', '0121 313 4567', NULL, '8 Beeches Walk', NULL, 'Birmingham', 'B73 6UQ', true, 'phone', true, 'Has two lawns - front and back.'),
  ('c0507777-7777-4777-a777-777777777777', 'GM-10007', 'David', 'Harrington', 'david.harrington@protonmail.com', '01889 563421', '07934 567890', 'The Old Rectory', 'Church Lane', 'Rugeley', 'WS15 2AH', true, 'email', true, 'Large property with multiple lawn areas.'),
  ('c0508888-8888-4888-a888-888888888888', 'GM-10008', 'Elizabeth', 'Norton', 'liz.norton@icloud.com', '01543 456789', NULL, '29 Beacon Street', NULL, 'Lichfield', 'WS13 7AR', true, 'email', false, 'Prefers afternoon appointments.'),
  ('c0509999-9999-4999-a999-999999999999', 'GM-10009', 'Robert', 'Kingswood', 'bob.kingswood@gmail.com', '01926 771234', '07856 789012', '45 Emscote Road', NULL, 'Warwick', 'CV34 5QJ', true, 'email', true, NULL),
  ('c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'GM-10010', 'Jennifer', 'Ashworth', 'jashworth@outlook.com', '0121 355 8901', NULL, '12 Mere Green Road', NULL, 'Sutton Coldfield', 'B75 5BT', true, 'email', true, 'Dog in garden - needs to be put inside.'),
  ('c050bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'GM-10011', 'Peter', 'Chambers', 'peter.chambers@btinternet.com', '01785 223456', '07867 890123', '67 Corporation Street', NULL, 'Stafford', 'ST16 3LQ', true, 'phone', false, NULL),
  ('c050cccc-cccc-4ccc-cccc-cccccccccccc', 'GM-10012', 'Helen', 'Fitzgerald', 'helen.fitz@gmail.com', '01926 334567', NULL, '3 Avenue Road', NULL, 'Leamington Spa', 'CV31 3PG', true, 'email', true, 'Keen gardener - wants detailed feedback.'),
  ('c050dddd-dddd-4ddd-dddd-dddddddddddd', 'GM-10013', 'Stephen', 'Morrison', 's.morrison@yahoo.co.uk', '0121 384 5678', NULL, '91 Chester Road', NULL, 'Erdington', 'B24 0ET', true, 'email', false, 'New build property - lawn established 2023.'),
  ('c050eeee-eeee-4eee-eeee-eeeeeeeeeeee', 'GM-10014', 'Caroline', 'Jennings', 'caroline.j@gmail.com', '01543 223456', '07878 901234', '14 Sandford Street', NULL, 'Lichfield', 'WS13 6QA', true, 'email', true, NULL),
  ('c050ffff-ffff-4fff-ffff-ffffffffffff', 'GM-10015', 'Nigel', 'Bradshaw', 'n.bradshaw@hotmail.co.uk', '01827 445678', NULL, '28 High Street', NULL, 'Polesworth', 'B78 1DU', true, 'phone', false, 'Narrow side access - equipment may need to go through house.'),
  ('c0500001-0001-4001-a001-000100010001', 'GM-10016', 'Angela', 'Prescott', 'aprescott@gmail.com', '0121 373 4567', NULL, '5 Orphanage Road', NULL, 'Erdington', 'B24 0AE', true, 'email', true, 'Ultimate programme customer.'),
  ('c0500002-0002-4002-a002-000200020002', 'GM-10017', 'Timothy', 'Holbrook', 't.holbrook@outlook.com', '01926 556789', '07889 012345', '88 Coten End', NULL, 'Warwick', 'CV34 4NP', true, 'email', true, NULL),
  ('c0500003-0003-4003-a003-000300030003', 'GM-10018', 'Fiona', 'MacDonald', 'fiona.mac@icloud.com', '01785 556789', NULL, '23 Rowley Street', NULL, 'Stafford', 'ST16 2RH', true, 'email', false, 'Only available Saturdays.'),
  ('c0500004-0004-4004-a004-000400040004', 'GM-10019', 'Graham', 'Atkinson', 'g.atkinson@btinternet.com', '0121 354 1234', NULL, '56 Boldmere Road', NULL, 'Sutton Coldfield', 'B73 5TJ', true, 'phone', true, 'Commercial property - car park access.'),
  ('c0500005-0005-4005-a005-000500050005', 'GM-10020', 'Valerie', 'Parsons', 'vparsons@yahoo.co.uk', '01926 889012', '07890 123456', '19 Cubbington Road', NULL, 'Leamington Spa', 'CV32 7AL', true, 'email', true, 'Referred by GM-10003.'),
  ('c0500006-0006-4006-a006-000600060006', 'GM-10021', 'Keith', 'Drummond', 'keith.d@gmail.com', '01543 778901', NULL, '41 Tamworth Street', NULL, 'Lichfield', 'WS13 6JR', true, 'email', false, NULL),
  ('c0500007-0007-4007-a007-000700070007', 'GM-10022', 'Sandra', 'Beaumont', 's.beaumont@hotmail.co.uk', '0121 355 2345', '07901 234567', '73 Streetly Lane', NULL, 'Sutton Coldfield', 'B74 2EX', true, 'phone', true, 'Has leatherjacket problem - needs annual treatment.'),
  ('c0500008-0008-4008-a008-000800080008', 'GM-10023', 'Philip', 'Cartwright', 'p.cartwright@protonmail.com', '01827 778901', NULL, '6 Church Walk', NULL, 'Atherstone', 'CV9 1DH', true, 'email', true, 'Large lawn with mature trees - partial shade.'),
  ('c0500009-0009-4009-a009-000900090009', 'GM-10024', 'Janet', 'Woodward', 'janet.w@gmail.com', '01785 889012', NULL, '112 Eccleshall Road', NULL, 'Stafford', 'ST16 1PD', true, 'email', false, NULL),
  ('c0500010-0010-4010-a010-001000100010', 'GM-10025', 'Martin', 'Spencer', 'mspencer@outlook.com', '01926 112345', '07912 345678', '34 Warwick Road', NULL, 'Kenilworth', 'CV8 1HE', true, 'email', true, 'Moss problem in north-facing garden.'),
  -- Additional customers 26-125 (100 more)
  -- Solihull Area
  ('c0500026-0026-4026-a026-002600260026', 'GM-10026', 'Victoria', 'Henderson', 'v.henderson@gmail.com', '0121 705 1234', NULL, '15 Warwick Road', NULL, 'Solihull', 'B91 3DA', true, 'email', true, NULL),
  ('c0500027-0027-4027-a027-002700270027', 'GM-10027', 'Christopher', 'Bailey', 'c.bailey@outlook.com', '0121 711 2345', '07845 123456', '48 Streetsbrook Road', NULL, 'Solihull', 'B91 1QT', true, 'email', true, 'Works from home - flexible.'),
  ('c0500028-0028-4028-a028-002800280028', 'GM-10028', 'Emma', 'Richardson', 'emma.r@btinternet.com', '0121 733 3456', NULL, '22 Lode Lane', NULL, 'Solihull', 'B91 2AB', true, 'phone', false, NULL),
  ('c0500029-0029-4029-a029-002900290029', 'GM-10029', 'Jonathan', 'Foster', 'j.foster@yahoo.co.uk', '0121 744 4567', NULL, '7 Hampton Lane', NULL, 'Solihull', 'B91 2PT', true, 'email', true, 'Golf club member - keen on lawn quality.'),
  ('c0500030-0030-4030-a030-003000300030', 'GM-10030', 'Rachel', 'Hughes', 'rhughes@icloud.com', '0121 722 5678', '07856 234567', '31 Blossomfield Road', NULL, 'Solihull', 'B91 1LG', true, 'email', true, NULL),
  -- Coventry Area
  ('c0500031-0031-4031-a031-003100310031', 'GM-10031', 'Mark', 'Williams', 'mark.w@gmail.com', '024 7659 1234', NULL, '56 Kenilworth Road', NULL, 'Coventry', 'CV4 7AL', true, 'email', true, NULL),
  ('c0500032-0032-4032-a032-003200320032', 'GM-10032', 'Laura', 'Brown', 'l.brown@hotmail.co.uk', '024 7650 2345', NULL, '12 Beechwood Avenue', NULL, 'Coventry', 'CV5 6DQ', true, 'phone', true, 'Children play on lawn.'),
  ('c0500033-0033-4033-a033-003300330033', 'GM-10033', 'Simon', 'Davies', 's.davies@protonmail.com', '024 7641 3456', '07867 345678', '89 Tile Hill Lane', NULL, 'Coventry', 'CV4 9DE', true, 'email', false, NULL),
  ('c0500034-0034-4034-a034-003400340034', 'GM-10034', 'Catherine', 'Wilson', 'c.wilson@outlook.com', '024 7633 4567', NULL, '23 Westwood Heath Road', NULL, 'Coventry', 'CV4 8GP', true, 'email', true, 'University lecturer - prefers term time.'),
  ('c0500035-0035-4035-a035-003500350035', 'GM-10035', 'Paul', 'Taylor', 'p.taylor@gmail.com', '024 7667 5678', NULL, '67 Allesley Old Road', NULL, 'Coventry', 'CV5 8BP', true, 'email', true, NULL),
  -- Wolverhampton Area
  ('c0500036-0036-4036-a036-003600360036', 'GM-10036', 'Amanda', 'Evans', 'a.evans@btinternet.com', '01902 423456', NULL, '14 Penn Road', NULL, 'Wolverhampton', 'WV3 0DU', true, 'email', true, NULL),
  ('c0500037-0037-4037-a037-003700370037', 'GM-10037', 'Stuart', 'Thomas', 'stuartthomas@yahoo.co.uk', '01902 445678', '07878 456789', '29 Tettenhall Road', NULL, 'Wolverhampton', 'WV3 9NH', true, 'phone', false, 'Large Victorian property.'),
  ('c0500038-0038-4038-a038-003800380038', 'GM-10038', 'Diane', 'Roberts', 'd.roberts@icloud.com', '01902 556789', NULL, '8 Compton Road', NULL, 'Wolverhampton', 'WV3 9PH', true, 'email', true, NULL),
  ('c0500039-0039-4039-a039-003900390039', 'GM-10039', 'Kevin', 'Johnson', 'k.johnson@outlook.com', '01902 667890', NULL, '45 Finchfield Road', NULL, 'Wolverhampton', 'WV3 8AY', true, 'email', true, 'Dog owner - needs notice.'),
  ('c0500040-0040-4040-a040-004000400040', 'GM-10040', 'Sarah', 'Martin', 's.martin@gmail.com', '01902 778901', '07889 567890', '62 Castlecroft Road', NULL, 'Wolverhampton', 'WV3 8BZ', true, 'email', true, NULL),
  -- Walsall Area
  ('c0500041-0041-4041-a041-004100410041', 'GM-10041', 'Andrew', 'Clark', 'a.clark@hotmail.co.uk', '01922 623456', NULL, '17 Sutton Road', NULL, 'Walsall', 'WS1 2PQ', true, 'email', true, NULL),
  ('c0500042-0042-4042-a042-004200420042', 'GM-10042', 'Michelle', 'Lewis', 'm.lewis@gmail.com', '01922 645678', NULL, '34 Broadway North', NULL, 'Walsall', 'WS1 2DJ', true, 'email', false, 'Retired - usually at home.'),
  ('c0500043-0043-4043-a043-004300430043', 'GM-10043', 'Gary', 'Walker', 'g.walker@btinternet.com', '01922 667890', '07890 678901', '51 Lichfield Road', NULL, 'Walsall', 'WS4 2DJ', true, 'phone', true, NULL),
  ('c0500044-0044-4044-a044-004400440044', 'GM-10044', 'Julie', 'Hall', 'j.hall@yahoo.co.uk', '01922 789012', NULL, '28 Mellish Road', NULL, 'Walsall', 'WS4 2DG', true, 'email', true, 'Teacher - summer appointments best.'),
  ('c0500045-0045-4045-a045-004500450045', 'GM-10045', 'Steven', 'Young', 's.young@outlook.com', '01922 890123', NULL, '9 Aldridge Road', NULL, 'Walsall', 'WS4 2ET', true, 'email', true, NULL),
  -- Dudley Area
  ('c0500046-0046-4046-a046-004600460046', 'GM-10046', 'Karen', 'King', 'k.king@icloud.com', '01384 254567', NULL, '21 Stourbridge Road', NULL, 'Dudley', 'DY1 2ER', true, 'email', true, NULL),
  ('c0500047-0047-4047-a047-004700470047', 'GM-10047', 'Brian', 'Wright', 'b.wright@gmail.com', '01384 276789', '07901 789012', '43 Birmingham Road', NULL, 'Dudley', 'DY1 4SJ', true, 'email', true, 'Historic house - traditional garden.'),
  ('c0500048-0048-4048-a048-004800480048', 'GM-10048', 'Tracey', 'Green', 't.green@hotmail.co.uk', '01384 298901', NULL, '16 High Street', NULL, 'Dudley', 'DY3 1TU', true, 'phone', false, NULL),
  ('c0500049-0049-4049-a049-004900490049', 'GM-10049', 'Neil', 'Baker', 'n.baker@btinternet.com', '01384 310123', NULL, '58 Himley Road', NULL, 'Dudley', 'DY3 4LB', true, 'email', true, NULL),
  ('c0500050-0050-4050-a050-005000500050', 'GM-10050', 'Claire', 'Adams', 'c.adams@outlook.com', '01384 332345', '07912 890123', '75 Priory Road', NULL, 'Dudley', 'DY1 4EH', true, 'email', true, 'Wants organic treatments only.'),
  -- Rugby Area
  ('c0500051-0051-4051-a051-005100510051', 'GM-10051', 'Darren', 'Nelson', 'd.nelson@gmail.com', '01788 543456', NULL, '12 Murray Road', NULL, 'Rugby', 'CV21 3JY', true, 'email', true, NULL),
  ('c0500052-0052-4052-a052-005200520052', 'GM-10052', 'Nicola', 'Hill', 'n.hill@yahoo.co.uk', '01788 565678', NULL, '27 Hillmorton Road', NULL, 'Rugby', 'CV22 5AA', true, 'email', true, 'Key under mat for side gate.'),
  ('c0500053-0053-4053-a053-005300530053', 'GM-10053', 'Ian', 'Scott', 'i.scott@hotmail.co.uk', '01788 587890', '07923 901234', '44 Dunchurch Road', NULL, 'Rugby', 'CV22 6AU', true, 'phone', false, NULL),
  ('c0500054-0054-4054-a054-005400540054', 'GM-10054', 'Wendy', 'Campbell', 'w.campbell@icloud.com', '01788 609012', NULL, '8 Barby Road', NULL, 'Rugby', 'CV22 5DT', true, 'email', true, NULL),
  ('c0500055-0055-4055-a055-005500550055', 'GM-10055', 'Dean', 'Mitchell', 'dean.m@protonmail.com', '01788 621234', NULL, '63 Lawford Road', NULL, 'Rugby', 'CV21 2EA', true, 'email', true, 'Works shifts - flexible timing.'),
  -- Tamworth Area
  ('c0500056-0056-4056-a056-005600560056', 'GM-10056', 'Alison', 'Carter', 'a.carter@gmail.com', '01827 312345', NULL, '19 Lichfield Street', NULL, 'Tamworth', 'B79 7QF', true, 'email', true, NULL),
  ('c0500057-0057-4057-a057-005700570057', 'GM-10057', 'Wayne', 'Phillips', 'w.phillips@btinternet.com', '01827 334567', '07934 012345', '35 Ashby Road', NULL, 'Tamworth', 'B79 8AH', true, 'email', false, NULL),
  ('c0500058-0058-4058-a058-005800580058', 'GM-10058', 'Joanne', 'Turner', 'j.turner@outlook.com', '01827 356789', NULL, '52 Coton Lane', NULL, 'Tamworth', 'B79 8LJ', true, 'phone', true, 'New customer - first treatment March 2025.'),
  ('c0500059-0059-4059-a059-005900590059', 'GM-10059', 'Craig', 'Parker', 'c.parker@yahoo.co.uk', '01827 378901', NULL, '71 Glascote Road', NULL, 'Tamworth', 'B77 2AA', true, 'email', true, NULL),
  ('c0500060-0060-4060-a060-006000600060', 'GM-10060', 'Deborah', 'Collins', 'd.collins@icloud.com', '01827 390123', '07945 123456', '14 Dosthill Road', NULL, 'Tamworth', 'B77 1LH', true, 'email', true, NULL),
  -- Stratford-upon-Avon Area
  ('c0500061-0061-4061-a061-006100610061', 'GM-10061', 'Adrian', 'Edwards', 'a.edwards@gmail.com', '01789 267890', NULL, '8 Alcester Road', NULL, 'Stratford-upon-Avon', 'CV37 9DD', true, 'email', true, 'Tourist B&B - lawn must look perfect.'),
  ('c0500062-0062-4062-a062-006200620062', 'GM-10062', 'Linda', 'Bell', 'l.bell@hotmail.co.uk', '01789 289012', NULL, '25 Shipston Road', NULL, 'Stratford-upon-Avon', 'CV37 7LN', true, 'email', true, NULL),
  ('c0500063-0063-4063-a063-006300630063', 'GM-10063', 'Tony', 'Morris', 't.morris@btinternet.com', '01789 301234', '07956 234567', '42 Evesham Road', NULL, 'Stratford-upon-Avon', 'CV37 9BA', true, 'phone', false, NULL),
  ('c0500064-0064-4064-a064-006400640064', 'GM-10064', 'Beverley', 'Watson', 'b.watson@outlook.com', '01789 323456', NULL, '67 Tiddington Road', NULL, 'Stratford-upon-Avon', 'CV37 7AY', true, 'email', true, 'Near the river - can be damp.'),
  ('c0500065-0065-4065-a065-006500650065', 'GM-10065', 'Malcolm', 'Price', 'm.price@yahoo.co.uk', '01789 345678', NULL, '11 Warwick Road', NULL, 'Stratford-upon-Avon', 'CV37 6YW', true, 'email', true, NULL),
  -- More Birmingham Suburbs
  ('c0500066-0066-4066-a066-006600660066', 'GM-10066', 'Jacqueline', 'Bennett', 'j.bennett@gmail.com', '0121 427 6789', NULL, '38 Harborne Road', NULL, 'Birmingham', 'B15 3AA', true, 'email', true, NULL),
  ('c0500067-0067-4067-a067-006700670067', 'GM-10067', 'Carl', 'Wood', 'c.wood@icloud.com', '0121 449 7890', '07967 345678', '54 Vicarage Road', NULL, 'Birmingham', 'B14 7QE', true, 'email', true, 'Edgbaston cricket ground nearby.'),
  ('c0500068-0068-4068-a068-006800680068', 'GM-10068', 'Teresa', 'Barnes', 't.barnes@hotmail.co.uk', '0121 472 8901', NULL, '19 Bristol Road', NULL, 'Birmingham', 'B29 6BD', true, 'phone', false, NULL),
  ('c0500069-0069-4069-a069-006900690069', 'GM-10069', 'Russell', 'Ross', 'r.ross@btinternet.com', '0121 475 9012', NULL, '76 Pershore Road', NULL, 'Birmingham', 'B30 3EJ', true, 'email', true, 'Victorian terrace - small lawn.'),
  ('c0500070-0070-4070-a070-007000700070', 'GM-10070', 'Debra', 'Powell', 'd.powell@outlook.com', '0121 451 0123', '07978 456789', '33 Raddlebarn Road', NULL, 'Birmingham', 'B29 6HQ', true, 'email', true, NULL),
  -- Nuneaton/Bedworth Area
  ('c0500071-0071-4071-a071-007100710071', 'GM-10071', 'Trevor', 'Butler', 't.butler@gmail.com', '024 7638 1234', NULL, '22 Queens Road', NULL, 'Nuneaton', 'CV11 5JY', true, 'email', true, NULL),
  ('c0500072-0072-4072-a072-007200720072', 'GM-10072', 'Pauline', 'Russell', 'p.russell@yahoo.co.uk', '024 7631 2345', NULL, '45 Tuttle Hill', NULL, 'Nuneaton', 'CV10 0NQ', true, 'email', false, 'Bungalow - easy access.'),
  ('c0500073-0073-4073-a073-007300730073', 'GM-10073', 'Roy', 'Griffin', 'r.griffin@hotmail.co.uk', '024 7649 3456', '07989 567890', '68 Hinckley Road', NULL, 'Nuneaton', 'CV10 7AX', true, 'phone', true, NULL),
  ('c0500074-0074-4074-a074-007400740074', 'GM-10074', 'Elaine', 'Hayes', 'e.hayes@icloud.com', '024 7631 4567', NULL, '13 Arbury Road', NULL, 'Nuneaton', 'CV10 7NE', true, 'email', true, NULL),
  ('c0500075-0075-4075-a075-007500750075', 'GM-10075', 'Gordon', 'Reynolds', 'g.reynolds@btinternet.com', '024 7631 5678', NULL, '87 Weddington Road', NULL, 'Nuneaton', 'CV10 0AG', true, 'email', true, 'Corner plot - two lawn areas.'),
  -- Redditch Area
  ('c0500076-0076-4076-a076-007600760076', 'GM-10076', 'Kathleen', 'Long', 'k.long@outlook.com', '01527 523456', NULL, '16 Bromsgrove Road', NULL, 'Redditch', 'B97 4RN', true, 'email', true, NULL),
  ('c0500077-0077-4077-a077-007700770077', 'GM-10077', 'Dennis', 'Graham', 'd.graham@gmail.com', '01527 545678', '07990 678901', '39 Evesham Street', NULL, 'Redditch', 'B97 4HU', true, 'email', false, NULL),
  ('c0500078-0078-4078-a078-007800780078', 'GM-10078', 'Lesley', 'Fisher', 'l.fisher@yahoo.co.uk', '01527 567890', NULL, '52 Alcester Street', NULL, 'Redditch', 'B98 8AE', true, 'phone', true, 'New estate - young lawn.'),
  ('c0500079-0079-4079-a079-007900790079', 'GM-10079', 'Colin', 'Webb', 'c.webb@hotmail.co.uk', '01527 589012', NULL, '78 Studley Road', NULL, 'Redditch', 'B98 7HB', true, 'email', true, NULL),
  ('c0500080-0080-4080-a080-008000800080', 'GM-10080', 'Hazel', 'Simpson', 'h.simpson@icloud.com', '01527 601234', '07901 789012', '23 Plymouth Road', NULL, 'Redditch', 'B97 4PA', true, 'email', true, NULL),
  -- Bromsgrove Area
  ('c0500081-0081-4081-a081-008100810081', 'GM-10081', 'Kenneth', 'Murray', 'k.murray@btinternet.com', '01527 873456', NULL, '34 Worcester Road', NULL, 'Bromsgrove', 'B61 7DN', true, 'email', true, 'Market town centre - limited parking.'),
  ('c0500082-0082-4082-a082-008200820082', 'GM-10082', 'Maureen', 'Kelly', 'm.kelly@gmail.com', '01527 895678', NULL, '57 Birmingham Road', NULL, 'Bromsgrove', 'B61 0DD', true, 'email', true, NULL),
  ('c0500083-0083-4083-a083-008300830083', 'GM-10083', 'Norman', 'Hunt', 'n.hunt@outlook.com', '01527 817890', '07912 890123', '12 Stourbridge Road', NULL, 'Bromsgrove', 'B61 0AE', true, 'phone', false, NULL),
  ('c0500084-0084-4084-a084-008400840084', 'GM-10084', 'Gillian', 'Holmes', 'g.holmes@yahoo.co.uk', '01527 839012', NULL, '89 Kidderminster Road', NULL, 'Bromsgrove', 'B61 9JT', true, 'email', true, 'Large rural garden.'),
  ('c0500085-0085-4085-a085-008500850085', 'GM-10085', 'Raymond', 'Ford', 'r.ford@hotmail.co.uk', '01527 851234', NULL, '45 Finstall Road', NULL, 'Bromsgrove', 'B60 3DJ', true, 'email', true, NULL),
  -- Halesowen Area
  ('c0500086-0086-4086-a086-008600860086', 'GM-10086', 'Irene', 'Matthews', 'i.matthews@icloud.com', '0121 550 6789', NULL, '28 Hagley Road', NULL, 'Halesowen', 'B63 4QD', true, 'email', true, NULL),
  ('c0500087-0087-4087-a087-008700870087', 'GM-10087', 'Derek', 'Palmer', 'd.palmer@gmail.com', '0121 559 7890', '07923 901234', '61 Stourbridge Road', NULL, 'Halesowen', 'B63 3TU', true, 'email', false, 'Keen bowler - flat lawn preferred.'),
  ('c0500088-0088-4088-a088-008800880088', 'GM-10088', 'Judith', 'Grant', 'j.grant@btinternet.com', '0121 585 8901', NULL, '14 High Street', NULL, 'Halesowen', 'B63 3BG', true, 'phone', true, NULL),
  ('c0500089-0089-4089-a089-008900890089', 'GM-10089', 'Frank', 'Stone', 'f.stone@outlook.com', '0121 550 9012', NULL, '77 Hagley Road', NULL, 'Halesowen', 'B63 4RD', true, 'email', true, NULL),
  ('c0500090-0090-4090-a090-009000900090', 'GM-10090', 'Jean', 'Harvey', 'j.harvey@yahoo.co.uk', '0121 503 0123', '07934 012345', '32 Furnace Lane', NULL, 'Halesowen', 'B63 3NQ', true, 'email', true, 'Industrial heritage area.'),
  -- Stourbridge Area
  ('c0500091-0091-4091-a091-009100910091', 'GM-10091', 'Roger', 'Dixon', 'r.dixon@hotmail.co.uk', '01384 393456', NULL, '19 High Street', NULL, 'Stourbridge', 'DY8 1DZ', true, 'email', true, NULL),
  ('c0500092-0092-4092-a092-009200920092', 'GM-10092', 'Audrey', 'Wallace', 'a.wallace@icloud.com', '01384 375678', NULL, '42 Hagley Road', NULL, 'Stourbridge', 'DY8 1QH', true, 'email', true, 'Glass-making heritage area.'),
  ('c0500093-0093-4093-a093-009300930093', 'GM-10093', 'Howard', 'Gibson', 'h.gibson@gmail.com', '01384 397890', '07945 123456', '65 Worcester Street', NULL, 'Stourbridge', 'DY8 1AT', true, 'phone', false, NULL),
  ('c0500094-0094-4094-a094-009400940094', 'GM-10094', 'Sheila', 'Harrison', 's.harrison@btinternet.com', '01384 319012', NULL, '8 Enville Street', NULL, 'Stourbridge', 'DY8 1XA', true, 'email', true, NULL),
  ('c0500095-0095-4095-a095-009500950095', 'GM-10095', 'George', 'Mills', 'g.mills@outlook.com', '01384 331234', NULL, '91 South Road', NULL, 'Stourbridge', 'DY8 3YA', true, 'email', true, 'Near Mary Stevens Park.'),
  -- Cannock Area
  ('c0500096-0096-4096-a096-009600960096', 'GM-10096', 'Brenda', 'Pearce', 'b.pearce@yahoo.co.uk', '01543 573456', NULL, '24 Walsall Road', NULL, 'Cannock', 'WS11 1NP', true, 'email', true, NULL),
  ('c0500097-0097-4097-a097-009700970097', 'GM-10097', 'Leonard', 'Austin', 'l.austin@hotmail.co.uk', '01543 595678', '07956 234567', '47 Stafford Road', NULL, 'Cannock', 'WS11 4AP', true, 'email', false, 'Near Cannock Chase - sandy soil.'),
  ('c0500098-0098-4098-a098-009800980098', 'GM-10098', 'Sylvia', 'Stevens', 's.stevens@icloud.com', '01543 517890', NULL, '63 Hednesford Road', NULL, 'Cannock', 'WS12 4PB', true, 'phone', true, NULL),
  ('c0500099-0099-4099-a099-009900990099', 'GM-10099', 'Victor', 'Fox', 'v.fox@gmail.com', '01543 539012', NULL, '18 High Green', NULL, 'Cannock', 'WS11 1BT', true, 'email', true, NULL),
  ('c0500100-0100-4100-a100-010001000100', 'GM-10100', 'Rosemary', 'Cole', 'r.cole@btinternet.com', '01543 551234', '07967 345678', '82 Wolverhampton Road', NULL, 'Cannock', 'WS11 1AP', true, 'email', true, NULL),
  -- More Sutton Coldfield/Erdington
  ('c0500101-0101-4101-a101-010101010101', 'GM-10101', 'Stanley', 'Reed', 's.reed@outlook.com', '0121 373 6789', NULL, '11 High Street', NULL, 'Erdington', 'B23 6SY', true, 'email', true, NULL),
  ('c0500102-0102-4102-a102-010201020102', 'GM-10102', 'Dorothy', 'Brooks', 'd.brooks@yahoo.co.uk', '0121 355 7890', NULL, '36 Boldmere Road', NULL, 'Sutton Coldfield', 'B73 5TD', true, 'email', true, 'Elderly - prefers same operator.'),
  ('c0500103-0103-4103-a103-010301030103', 'GM-10103', 'Frederick', 'Mason', 'f.mason@hotmail.co.uk', '0121 354 8901', '07978 456789', '59 Wylde Green Road', NULL, 'Sutton Coldfield', 'B73 5PN', true, 'phone', false, NULL),
  ('c0500104-0104-4104-a104-010401040104', 'GM-10104', 'Vera', 'Lane', 'v.lane@icloud.com', '0121 378 9012', NULL, '74 Jockey Road', NULL, 'Sutton Coldfield', 'B73 5XL', true, 'email', true, 'Near Sutton Park - wildlife friendly.'),
  ('c0500105-0105-4105-a105-010501050105', 'GM-10105', 'Bernard', 'Cooper', 'b.cooper@gmail.com', '0121 386 0123', NULL, '27 Chester Road North', NULL, 'Sutton Coldfield', 'B73 6SP', true, 'email', true, NULL),
  -- More Leamington/Warwick
  ('c0500106-0106-4106-a106-010601060106', 'GM-10106', 'Olive', 'Saunders', 'o.saunders@btinternet.com', '01926 423456', NULL, '48 Parade', NULL, 'Leamington Spa', 'CV32 4DE', true, 'email', true, 'Regency property - formal garden.'),
  ('c0500107-0107-4107-a107-010701070107', 'GM-10107', 'Arthur', 'Day', 'a.day@outlook.com', '01926 445678', '07989 567890', '15 Clarendon Avenue', NULL, 'Leamington Spa', 'CV32 4PZ', true, 'email', false, NULL),
  ('c0500108-0108-4108-a108-010801080108', 'GM-10108', 'Joyce', 'Owen', 'j.owen@yahoo.co.uk', '01926 467890', NULL, '82 Warwick Street', NULL, 'Leamington Spa', 'CV32 5JY', true, 'phone', true, NULL),
  ('c0500109-0109-4109-a109-010901090109', 'GM-10109', 'Harold', 'Perry', 'h.perry@hotmail.co.uk', '01926 489012', NULL, '31 Rugby Road', NULL, 'Leamington Spa', 'CV32 6PZ', true, 'email', true, 'Allotment next door - organic gardener.'),
  ('c0500110-0110-4110-a110-011001100110', 'GM-10110', 'Marion', 'Ward', 'm.ward@icloud.com', '01926 401234', '07990 678901', '56 Tachbrook Road', NULL, 'Leamington Spa', 'CV31 3EF', true, 'email', true, NULL),
  -- More Lichfield/Burntwood
  ('c0500111-0111-4111-a111-011101110111', 'GM-10111', 'Ernest', 'Knight', 'e.knight@gmail.com', '01543 263456', NULL, '9 Bore Street', NULL, 'Lichfield', 'WS13 6LU', true, 'email', true, 'Cathedral close - historic area.'),
  ('c0500112-0112-4112-a112-011201120112', 'GM-10112', 'Gladys', 'Davidson', 'g.davidson@btinternet.com', '01543 285678', NULL, '34 St John Street', NULL, 'Lichfield', 'WS13 6PB', true, 'email', true, NULL),
  ('c0500113-0113-4113-a113-011301130113', 'GM-10113', 'Leslie', 'Burns', 'l.burns@outlook.com', '01543 307890', '07901 789012', '57 Walsall Road', NULL, 'Lichfield', 'WS13 8AF', true, 'phone', false, 'Large lawn - needs full day.'),
  ('c0500114-0114-4114-a114-011401140114', 'GM-10114', 'Doris', 'Freeman', 'd.freeman@yahoo.co.uk', '01543 329012', NULL, '72 Birmingham Road', NULL, 'Lichfield', 'WS14 9BQ', true, 'email', true, NULL),
  ('c0500115-0115-4115-a115-011501150115', 'GM-10115', 'Ronald', 'Wells', 'r.wells@hotmail.co.uk', '01543 341234', NULL, '15 Cannock Road', NULL, 'Burntwood', 'WS7 0BH', true, 'email', true, 'New development - good access.'),
  -- More Stafford Area
  ('c0500116-0116-4116-a116-011601160116', 'GM-10116', 'Edna', 'Chapman', 'e.chapman@icloud.com', '01785 253456', NULL, '28 Gaol Road', NULL, 'Stafford', 'ST16 3AQ', true, 'email', true, NULL),
  ('c0500117-0117-4117-a117-011701170117', 'GM-10117', 'Albert', 'Andrews', 'a.andrews@gmail.com', '01785 275678', '07912 890123', '41 Newport Road', NULL, 'Stafford', 'ST16 1BB', true, 'email', false, NULL),
  ('c0500118-0118-4118-a118-011801180118', 'GM-10118', 'Marjorie', 'Black', 'm.black@btinternet.com', '01785 297890', NULL, '64 Stone Road', NULL, 'Stafford', 'ST16 1NR', true, 'phone', true, 'Near county showground.'),
  ('c0500119-0119-4119-a119-011901190119', 'GM-10119', 'Herbert', 'Dunn', 'h.dunn@outlook.com', '01785 319012', NULL, '87 Wolverhampton Road', NULL, 'Stafford', 'ST17 4AW', true, 'email', true, NULL),
  ('c0500120-0120-4120-a120-012001200120', 'GM-10120', 'Hilda', 'Elliott', 'h.elliott@yahoo.co.uk', '01785 331234', '07923 901234', '19 Sandon Road', NULL, 'Stafford', 'ST16 3HA', true, 'email', true, NULL),
  -- Final batch - Mixed areas
  ('c0500121-0121-4121-a121-012101210121', 'GM-10121', 'Cyril', 'Morrison', 'c.morrison@hotmail.co.uk', '01952 243456', NULL, '31 Wellington Road', NULL, 'Newport', 'TF10 7HE', true, 'email', true, 'Edge of service area - extra travel.'),
  ('c0500122-0122-4122-a122-012201220122', 'GM-10122', 'Doreen', 'Fowler', 'd.fowler@icloud.com', '01952 265678', NULL, '46 High Street', NULL, 'Newport', 'TF10 7AT', true, 'email', true, NULL),
  ('c0500123-0123-4123-a123-012301230123', 'GM-10123', 'Clifford', 'Barker', 'c.barker@gmail.com', '01952 287890', '07934 012345', '69 Station Road', NULL, 'Newport', 'TF10 7EN', true, 'phone', false, NULL),
  ('c0500124-0124-4124-a124-012401240124', 'GM-10124', 'Mabel', 'Cross', 'm.cross@btinternet.com', '01952 309012', NULL, '12 Stafford Street', NULL, 'Newport', 'TF10 7NU', true, 'email', true, 'Historic market town.'),
  ('c0500125-0125-4125-a125-012501250125', 'GM-10125', 'Walter', 'Spencer', 'w.spencer@outlook.com', '01952 321234', NULL, '85 Audley Avenue', NULL, 'Newport', 'TF10 7BT', true, 'email', true, 'Last customer in catchment.');

-- ============================================================================
-- PROPERTIES (Physical locations with lawns)
-- Coordinates approximate to West Midlands area
-- ============================================================================
INSERT INTO properties (id, customer_id, address_line1, address_line2, city, postcode, latitude, longitude, access_notes, is_active) VALUES
  -- Sutton Coldfield area
  ('00101111-1111-4111-a111-111111111111', 'c0501111-1111-4111-a111-111111111111', '42 Walmley Road', NULL, 'Sutton Coldfield', 'B76 1QN', 52.5523, -1.8234, 'Side gate access. Ring doorbell on arrival.', true),
  ('00102222-2222-4222-a222-222222222222', 'c0502222-2222-4222-a222-222222222222', '18 Rectory Road', NULL, 'Sutton Coldfield', 'B75 7RJ', 52.5612, -1.8156, 'Gate code: 4521. Rear garden only.', true),
  ('0010aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '12 Mere Green Road', NULL, 'Sutton Coldfield', 'B75 5BT', 52.5678, -1.8089, 'Dog will be inside. Use side gate.', true),
  ('00100001-0001-4001-a001-000100010001', 'c0500001-0001-4001-a001-000100010001', '5 Orphanage Road', NULL, 'Erdington', 'B24 0AE', 52.5234, -1.8345, 'Parking on street. Front and back lawns.', true),
  ('00100004-0004-4004-a004-000400040004', 'c0500004-0004-4004-a004-000400040004', '56 Boldmere Road', NULL, 'Sutton Coldfield', 'B73 5TJ', 52.5456, -1.8123, 'Car park at rear. Access via service road.', true),
  ('00100007-0007-4007-a007-000700070007', 'c0500007-0007-4007-a007-000700070007', '73 Streetly Lane', NULL, 'Sutton Coldfield', 'B74 2EX', 52.5789, -1.8567, 'Large corner plot. Park on Streetly Lane.', true),
  ('00106666-6666-4666-a666-666666666666', 'c0506666-6666-4666-a666-666666666666', '8 Beeches Walk', NULL, 'Birmingham', 'B73 6UQ', 52.5345, -1.8234, 'Two separate lawns. Treat both on same visit.', true),
  ('0010dddd-dddd-4ddd-dddd-dddddddddddd', 'c050dddd-dddd-4ddd-dddd-dddddddddddd', '91 Chester Road', NULL, 'Erdington', 'B24 0ET', 52.5189, -1.8456, 'New build. Rear access only via alley.', true),

  -- Leamington Spa / Warwick area
  ('00103333-3333-4333-a333-333333333333', 'c0503333-3333-4333-a333-333333333333', '7 Milverton Crescent', NULL, 'Leamington Spa', 'CV32 5QR', 52.2891, -1.5367, 'Key under third plant pot for side gate.', true),
  ('00104444-4444-4444-a444-444444444444', 'c0504444-4444-4444-a444-444444444444', '23 Kenilworth Road', NULL, 'Leamington Spa', 'CV32 6JT', 52.2934, -1.5234, 'Please knock loudly - customer hard of hearing.', true),
  ('0010cccc-cccc-4ccc-cccc-cccccccccccc', 'c050cccc-cccc-4ccc-cccc-cccccccccccc', '3 Avenue Road', NULL, 'Leamington Spa', 'CV31 3PG', 52.2823, -1.5289, 'Customer is often in garden.', true),
  ('00100005-0005-4005-a005-000500050005', 'c0500005-0005-4005-a005-000500050005', '19 Cubbington Road', NULL, 'Leamington Spa', 'CV32 7AL', 52.2956, -1.5123, NULL, true),
  ('00109999-9999-4999-a999-999999999999', 'c0509999-9999-4999-a999-999999999999', '45 Emscote Road', NULL, 'Warwick', 'CV34 5QJ', 52.2789, -1.5834, NULL, true),
  ('00100002-0002-4002-a002-000200020002', 'c0500002-0002-4002-a002-000200020002', '88 Coten End', NULL, 'Warwick', 'CV34 4NP', 52.2834, -1.5789, 'Driveway parking available.', true),
  ('00100010-0010-4010-a010-001000100010', 'c0500010-0010-4010-a010-001000100010', '34 Warwick Road', NULL, 'Kenilworth', 'CV8 1HE', 52.3412, -1.5678, 'North-facing garden. Heavy moss problem.', true),

  -- Lichfield area
  ('00108888-8888-4888-a888-888888888888', 'c0508888-8888-4888-a888-888888888888', '29 Beacon Street', NULL, 'Lichfield', 'WS13 7AR', 52.6823, -1.8267, 'Afternoon appointments only.', true),
  ('0010eeee-eeee-4eee-eeee-eeeeeeeeeeee', 'c050eeee-eeee-4eee-eeee-eeeeeeeeeeee', '14 Sandford Street', NULL, 'Lichfield', 'WS13 6QA', 52.6856, -1.8234, NULL, true),
  ('00100006-0006-4006-a006-000600060006', 'c0500006-0006-4006-a006-000600060006', '41 Tamworth Street', NULL, 'Lichfield', 'WS13 6JR', 52.6789, -1.8189, 'Small courtyard lawn. Quick job.', true),

  -- Stafford area
  ('0010bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'c050bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '67 Corporation Street', NULL, 'Stafford', 'ST16 3LQ', 52.8067, -2.1167, NULL, true),
  ('00100003-0003-4003-a003-000300030003', 'c0500003-0003-4003-a003-000300030003', '23 Rowley Street', NULL, 'Stafford', 'ST16 2RH', 52.8089, -2.1234, 'Saturday appointments only.', true),
  ('00100009-0009-4009-a009-000900090009', 'c0500009-0009-4009-a009-000900090009', '112 Eccleshall Road', NULL, 'Stafford', 'ST16 1PD', 52.8123, -2.1345, NULL, true),

  -- Rural/Larger properties
  ('00105555-5555-4555-a555-555555555555', 'c0505555-5555-4555-a555-555555555555', '156 Coleshill Road', NULL, 'Curdworth', 'B76 9HG', 52.5234, -1.7456, 'Long driveway. Park near garage.', true),
  ('00107777-7777-4777-a777-777777777777', 'c0507777-7777-4777-a777-777777777777', 'The Old Rectory', 'Church Lane', 'Rugeley', 'WS15 2AH', 52.7612, -1.9345, 'Large property. Multiple lawn areas marked with stakes.', true),
  ('0010ffff-ffff-4fff-ffff-ffffffffffff', 'c050ffff-ffff-4fff-ffff-ffffffffffff', '28 High Street', NULL, 'Polesworth', 'B78 1DU', 52.6234, -1.6123, 'Narrow side access. May need to carry equipment through house.', true),
  ('00100008-0008-4008-a008-000800080008', 'c0500008-0008-4008-a008-000800080008', '6 Church Walk', NULL, 'Atherstone', 'CV9 1DH', 52.5789, -1.5567, 'Large lawn with mature trees. Partial shade.', true),
  -- Additional properties for customers 26-125
  -- Solihull Area
  ('00100026-0026-4026-a026-002600260026', 'c0500026-0026-4026-a026-002600260026', '15 Warwick Road', NULL, 'Solihull', 'B91 3DA', 52.4111, -1.7768, NULL, true),
  ('00100027-0027-4027-a027-002700270027', 'c0500027-0027-4027-a027-002700270027', '48 Streetsbrook Road', NULL, 'Solihull', 'B91 1QT', 52.4089, -1.7823, NULL, true),
  ('00100028-0028-4028-a028-002800280028', 'c0500028-0028-4028-a028-002800280028', '22 Lode Lane', NULL, 'Solihull', 'B91 2AB', 52.4134, -1.7756, NULL, true),
  ('00100029-0029-4029-a029-002900290029', 'c0500029-0029-4029-a029-002900290029', '7 Hampton Lane', NULL, 'Solihull', 'B91 2PT', 52.4167, -1.7801, NULL, true),
  ('00100030-0030-4030-a030-003000300030', 'c0500030-0030-4030-a030-003000300030', '31 Blossomfield Road', NULL, 'Solihull', 'B91 1LG', 52.4078, -1.7834, NULL, true),
  -- Coventry Area
  ('00100031-0031-4031-a031-003100310031', 'c0500031-0031-4031-a031-003100310031', '56 Kenilworth Road', NULL, 'Coventry', 'CV4 7AL', 52.3856, -1.5345, NULL, true),
  ('00100032-0032-4032-a032-003200320032', 'c0500032-0032-4032-a032-003200320032', '12 Beechwood Avenue', NULL, 'Coventry', 'CV5 6DQ', 52.4012, -1.5567, NULL, true),
  ('00100033-0033-4033-a033-003300330033', 'c0500033-0033-4033-a033-003300330033', '89 Tile Hill Lane', NULL, 'Coventry', 'CV4 9DE', 52.3978, -1.5678, NULL, true),
  ('00100034-0034-4034-a034-003400340034', 'c0500034-0034-4034-a034-003400340034', '23 Westwood Heath Road', NULL, 'Coventry', 'CV4 8GP', 52.3934, -1.5789, NULL, true),
  ('00100035-0035-4035-a035-003500350035', 'c0500035-0035-4035-a035-003500350035', '67 Allesley Old Road', NULL, 'Coventry', 'CV5 8BP', 52.4045, -1.5456, NULL, true),
  -- Wolverhampton Area
  ('00100036-0036-4036-a036-003600360036', 'c0500036-0036-4036-a036-003600360036', '14 Penn Road', NULL, 'Wolverhampton', 'WV3 0DU', 52.5678, -2.1345, NULL, true),
  ('00100037-0037-4037-a037-003700370037', 'c0500037-0037-4037-a037-003700370037', '29 Tettenhall Road', NULL, 'Wolverhampton', 'WV3 9NH', 52.5789, -2.1456, NULL, true),
  ('00100038-0038-4038-a038-003800380038', 'c0500038-0038-4038-a038-003800380038', '8 Compton Road', NULL, 'Wolverhampton', 'WV3 9PH', 52.5812, -2.1512, NULL, true),
  ('00100039-0039-4039-a039-003900390039', 'c0500039-0039-4039-a039-003900390039', '45 Finchfield Road', NULL, 'Wolverhampton', 'WV3 8AY', 52.5745, -2.1378, NULL, true),
  ('00100040-0040-4040-a040-004000400040', 'c0500040-0040-4040-a040-004000400040', '62 Castlecroft Road', NULL, 'Wolverhampton', 'WV3 8BZ', 52.5701, -2.1423, NULL, true),
  -- Walsall Area
  ('00100041-0041-4041-a041-004100410041', 'c0500041-0041-4041-a041-004100410041', '17 Sutton Road', NULL, 'Walsall', 'WS1 2PQ', 52.5856, -1.9823, NULL, true),
  ('00100042-0042-4042-a042-004200420042', 'c0500042-0042-4042-a042-004200420042', '34 Broadway North', NULL, 'Walsall', 'WS1 2DJ', 52.5878, -1.9867, NULL, true),
  ('00100043-0043-4043-a043-004300430043', 'c0500043-0043-4043-a043-004300430043', '51 Lichfield Road', NULL, 'Walsall', 'WS4 2DJ', 52.6012, -1.9734, NULL, true),
  ('00100044-0044-4044-a044-004400440044', 'c0500044-0044-4044-a044-004400440044', '28 Mellish Road', NULL, 'Walsall', 'WS4 2DG', 52.5989, -1.9756, NULL, true),
  ('00100045-0045-4045-a045-004500450045', 'c0500045-0045-4045-a045-004500450045', '9 Aldridge Road', NULL, 'Walsall', 'WS4 2ET', 52.6034, -1.9678, NULL, true),
  -- Dudley Area
  ('00100046-0046-4046-a046-004600460046', 'c0500046-0046-4046-a046-004600460046', '21 Stourbridge Road', NULL, 'Dudley', 'DY1 2ER', 52.5123, -2.0845, NULL, true),
  ('00100047-0047-4047-a047-004700470047', 'c0500047-0047-4047-a047-004700470047', '43 Birmingham Road', NULL, 'Dudley', 'DY1 4SJ', 52.5156, -2.0789, NULL, true),
  ('00100048-0048-4048-a048-004800480048', 'c0500048-0048-4048-a048-004800480048', '16 High Street', NULL, 'Dudley', 'DY3 1TU', 52.5089, -2.0912, NULL, true),
  ('00100049-0049-4049-a049-004900490049', 'c0500049-0049-4049-a049-004900490049', '58 Himley Road', NULL, 'Dudley', 'DY3 4LB', 52.5034, -2.0978, NULL, true),
  ('00100050-0050-4050-a050-005000500050', 'c0500050-0050-4050-a050-005000500050', '75 Priory Road', NULL, 'Dudley', 'DY1 4EH', 52.5178, -2.0823, NULL, true),
  -- Rugby Area
  ('00100051-0051-4051-a051-005100510051', 'c0500051-0051-4051-a051-005100510051', '12 Murray Road', NULL, 'Rugby', 'CV21 3JY', 52.3712, -1.2634, NULL, true),
  ('00100052-0052-4052-a052-005200520052', 'c0500052-0052-4052-a052-005200520052', '27 Hillmorton Road', NULL, 'Rugby', 'CV22 5AA', 52.3689, -1.2567, NULL, true),
  ('00100053-0053-4053-a053-005300530053', 'c0500053-0053-4053-a053-005300530053', '44 Dunchurch Road', NULL, 'Rugby', 'CV22 6AU', 52.3656, -1.2689, NULL, true),
  ('00100054-0054-4054-a054-005400540054', 'c0500054-0054-4054-a054-005400540054', '8 Barby Road', NULL, 'Rugby', 'CV22 5DT', 52.3623, -1.2712, NULL, true),
  ('00100055-0055-4055-a055-005500550055', 'c0500055-0055-4055-a055-005500550055', '63 Lawford Road', NULL, 'Rugby', 'CV21 2EA', 52.3745, -1.2589, NULL, true),
  -- Tamworth Area
  ('00100056-0056-4056-a056-005600560056', 'c0500056-0056-4056-a056-005600560056', '19 Lichfield Street', NULL, 'Tamworth', 'B79 7QF', 52.6323, -1.6912, NULL, true),
  ('00100057-0057-4057-a057-005700570057', 'c0500057-0057-4057-a057-005700570057', '35 Ashby Road', NULL, 'Tamworth', 'B79 8AH', 52.6356, -1.6856, NULL, true),
  ('00100058-0058-4058-a058-005800580058', 'c0500058-0058-4058-a058-005800580058', '52 Coton Lane', NULL, 'Tamworth', 'B79 8LJ', 52.6389, -1.6789, NULL, true),
  ('00100059-0059-4059-a059-005900590059', 'c0500059-0059-4059-a059-005900590059', '71 Glascote Road', NULL, 'Tamworth', 'B77 2AA', 52.6245, -1.6945, NULL, true),
  ('00100060-0060-4060-a060-006000600060', 'c0500060-0060-4060-a060-006000600060', '14 Dosthill Road', NULL, 'Tamworth', 'B77 1LH', 52.6212, -1.6978, NULL, true),
  -- Stratford-upon-Avon Area
  ('00100061-0061-4061-a061-006100610061', 'c0500061-0061-4061-a061-006100610061', '8 Alcester Road', NULL, 'Stratford-upon-Avon', 'CV37 9DD', 52.1912, -1.7234, NULL, true),
  ('00100062-0062-4062-a062-006200620062', 'c0500062-0062-4062-a062-006200620062', '25 Shipston Road', NULL, 'Stratford-upon-Avon', 'CV37 7LN', 52.1878, -1.7167, NULL, true),
  ('00100063-0063-4063-a063-006300630063', 'c0500063-0063-4063-a063-006300630063', '42 Evesham Road', NULL, 'Stratford-upon-Avon', 'CV37 9BA', 52.1945, -1.7289, NULL, true),
  ('00100064-0064-4064-a064-006400640064', 'c0500064-0064-4064-a064-006400640064', '67 Tiddington Road', NULL, 'Stratford-upon-Avon', 'CV37 7AY', 52.1856, -1.7112, NULL, true),
  ('00100065-0065-4065-a065-006500650065', 'c0500065-0065-4065-a065-006500650065', '11 Warwick Road', NULL, 'Stratford-upon-Avon', 'CV37 6YW', 52.1934, -1.7189, NULL, true),
  -- More Birmingham Suburbs
  ('00100066-0066-4066-a066-006600660066', 'c0500066-0066-4066-a066-006600660066', '38 Harborne Road', NULL, 'Birmingham', 'B15 3AA', 52.4678, -1.9234, NULL, true),
  ('00100067-0067-4067-a067-006700670067', 'c0500067-0067-4067-a067-006700670067', '54 Vicarage Road', NULL, 'Birmingham', 'B14 7QE', 52.4512, -1.9367, NULL, true),
  ('00100068-0068-4068-a068-006800680068', 'c0500068-0068-4068-a068-006800680068', '19 Bristol Road', NULL, 'Birmingham', 'B29 6BD', 52.4489, -1.9423, NULL, true),
  ('00100069-0069-4069-a069-006900690069', 'c0500069-0069-4069-a069-006900690069', '76 Pershore Road', NULL, 'Birmingham', 'B30 3EJ', 52.4423, -1.9489, NULL, true),
  ('00100070-0070-4070-a070-007000700070', 'c0500070-0070-4070-a070-007000700070', '33 Raddlebarn Road', NULL, 'Birmingham', 'B29 6HQ', 52.4456, -1.9456, NULL, true),
  -- Nuneaton Area
  ('00100071-0071-4071-a071-007100710071', 'c0500071-0071-4071-a071-007100710071', '22 Queens Road', NULL, 'Nuneaton', 'CV11 5JY', 52.5234, -1.4712, NULL, true),
  ('00100072-0072-4072-a072-007200720072', 'c0500072-0072-4072-a072-007200720072', '45 Tuttle Hill', NULL, 'Nuneaton', 'CV10 0NQ', 52.5289, -1.4678, NULL, true),
  ('00100073-0073-4073-a073-007300730073', 'c0500073-0073-4073-a073-007300730073', '68 Hinckley Road', NULL, 'Nuneaton', 'CV10 7AX', 52.5312, -1.4623, NULL, true),
  ('00100074-0074-4074-a074-007400740074', 'c0500074-0074-4074-a074-007400740074', '13 Arbury Road', NULL, 'Nuneaton', 'CV10 7NE', 52.5356, -1.4589, NULL, true),
  ('00100075-0075-4075-a075-007500750075', 'c0500075-0075-4075-a075-007500750075', '87 Weddington Road', NULL, 'Nuneaton', 'CV10 0AG', 52.5378, -1.4534, NULL, true),
  -- Redditch Area
  ('00100076-0076-4076-a076-007600760076', 'c0500076-0076-4076-a076-007600760076', '16 Bromsgrove Road', NULL, 'Redditch', 'B97 4RN', 52.3089, -1.9456, NULL, true),
  ('00100077-0077-4077-a077-007700770077', 'c0500077-0077-4077-a077-007700770077', '39 Evesham Street', NULL, 'Redditch', 'B97 4HU', 52.3056, -1.9489, NULL, true),
  ('00100078-0078-4078-a078-007800780078', 'c0500078-0078-4078-a078-007800780078', '52 Alcester Street', NULL, 'Redditch', 'B98 8AE', 52.3023, -1.9523, NULL, true),
  ('00100079-0079-4079-a079-007900790079', 'c0500079-0079-4079-a079-007900790079', '78 Studley Road', NULL, 'Redditch', 'B98 7HB', 52.2989, -1.9556, NULL, true),
  ('00100080-0080-4080-a080-008000800080', 'c0500080-0080-4080-a080-008000800080', '23 Plymouth Road', NULL, 'Redditch', 'B97 4PA', 52.3112, -1.9423, NULL, true),
  -- Bromsgrove Area
  ('00100081-0081-4081-a081-008100810081', 'c0500081-0081-4081-a081-008100810081', '34 Worcester Road', NULL, 'Bromsgrove', 'B61 7DN', 52.3345, -2.0567, NULL, true),
  ('00100082-0082-4082-a082-008200820082', 'c0500082-0082-4082-a082-008200820082', '57 Birmingham Road', NULL, 'Bromsgrove', 'B61 0DD', 52.3378, -2.0512, NULL, true),
  ('00100083-0083-4083-a083-008300830083', 'c0500083-0083-4083-a083-008300830083', '12 Stourbridge Road', NULL, 'Bromsgrove', 'B61 0AE', 52.3312, -2.0623, NULL, true),
  ('00100084-0084-4084-a084-008400840084', 'c0500084-0084-4084-a084-008400840084', '89 Kidderminster Road', NULL, 'Bromsgrove', 'B61 9JT', 52.3289, -2.0678, NULL, true),
  ('00100085-0085-4085-a085-008500850085', 'c0500085-0085-4085-a085-008500850085', '45 Finstall Road', NULL, 'Bromsgrove', 'B60 3DJ', 52.3256, -2.0534, NULL, true),
  -- Halesowen Area
  ('00100086-0086-4086-a086-008600860086', 'c0500086-0086-4086-a086-008600860086', '28 Hagley Road', NULL, 'Halesowen', 'B63 4QD', 52.4512, -2.0512, NULL, true),
  ('00100087-0087-4087-a087-008700870087', 'c0500087-0087-4087-a087-008700870087', '61 Stourbridge Road', NULL, 'Halesowen', 'B63 3TU', 52.4478, -2.0567, NULL, true),
  ('00100088-0088-4088-a088-008800880088', 'c0500088-0088-4088-a088-008800880088', '14 High Street', NULL, 'Halesowen', 'B63 3BG', 52.4534, -2.0489, NULL, true),
  ('00100089-0089-4089-a089-008900890089', 'c0500089-0089-4089-a089-008900890089', '77 Hagley Road', NULL, 'Halesowen', 'B63 4RD', 52.4489, -2.0534, NULL, true),
  ('00100090-0090-4090-a090-009000900090', 'c0500090-0090-4090-a090-009000900090', '32 Furnace Lane', NULL, 'Halesowen', 'B63 3NQ', 52.4556, -2.0456, NULL, true),
  -- Stourbridge Area
  ('00100091-0091-4091-a091-009100910091', 'c0500091-0091-4091-a091-009100910091', '19 High Street', NULL, 'Stourbridge', 'DY8 1DZ', 52.4578, -2.1423, NULL, true),
  ('00100092-0092-4092-a092-009200920092', 'c0500092-0092-4092-a092-009200920092', '42 Hagley Road', NULL, 'Stourbridge', 'DY8 1QH', 52.4612, -2.1378, NULL, true),
  ('00100093-0093-4093-a093-009300930093', 'c0500093-0093-4093-a093-009300930093', '65 Worcester Street', NULL, 'Stourbridge', 'DY8 1AT', 52.4545, -2.1456, NULL, true),
  ('00100094-0094-4094-a094-009400940094', 'c0500094-0094-4094-a094-009400940094', '8 Enville Street', NULL, 'Stourbridge', 'DY8 1XA', 52.4589, -2.1489, NULL, true),
  ('00100095-0095-4095-a095-009500950095', 'c0500095-0095-4095-a095-009500950095', '91 South Road', NULL, 'Stourbridge', 'DY8 3YA', 52.4523, -2.1512, NULL, true),
  -- Cannock Area
  ('00100096-0096-4096-a096-009600960096', 'c0500096-0096-4096-a096-009600960096', '24 Walsall Road', NULL, 'Cannock', 'WS11 1NP', 52.6912, -2.0234, NULL, true),
  ('00100097-0097-4097-a097-009700970097', 'c0500097-0097-4097-a097-009700970097', '47 Stafford Road', NULL, 'Cannock', 'WS11 4AP', 52.6945, -2.0189, NULL, true),
  ('00100098-0098-4098-a098-009800980098', 'c0500098-0098-4098-a098-009800980098', '63 Hednesford Road', NULL, 'Cannock', 'WS12 4PB', 52.6978, -2.0134, NULL, true),
  ('00100099-0099-4099-a099-009900990099', 'c0500099-0099-4099-a099-009900990099', '18 High Green', NULL, 'Cannock', 'WS11 1BT', 52.6889, -2.0278, NULL, true),
  ('00100100-0100-4100-a100-010001000100', 'c0500100-0100-4100-a100-010001000100', '82 Wolverhampton Road', NULL, 'Cannock', 'WS11 1AP', 52.6856, -2.0312, NULL, true),
  -- More Sutton Coldfield/Erdington
  ('00100101-0101-4101-a101-010101010101', 'c0500101-0101-4101-a101-010101010101', '11 High Street', NULL, 'Erdington', 'B23 6SY', 52.5234, -1.8389, NULL, true),
  ('00100102-0102-4102-a102-010201020102', 'c0500102-0102-4102-a102-010201020102', '36 Boldmere Road', NULL, 'Sutton Coldfield', 'B73 5TD', 52.5312, -1.8312, NULL, true),
  ('00100103-0103-4103-a103-010301030103', 'c0500103-0103-4103-a103-010301030103', '59 Wylde Green Road', NULL, 'Sutton Coldfield', 'B73 5PN', 52.5345, -1.8278, NULL, true),
  ('00100104-0104-4104-a104-010401040104', 'c0500104-0104-4104-a104-010401040104', '74 Jockey Road', NULL, 'Sutton Coldfield', 'B73 5XL', 52.5378, -1.8245, NULL, true),
  ('00100105-0105-4105-a105-010501050105', 'c0500105-0105-4105-a105-010501050105', '27 Chester Road North', NULL, 'Sutton Coldfield', 'B73 6SP', 52.5412, -1.8212, NULL, true),
  -- More Leamington/Warwick
  ('00100106-0106-4106-a106-010601060106', 'c0500106-0106-4106-a106-010601060106', '48 Parade', NULL, 'Leamington Spa', 'CV32 4DE', 52.2912, -1.5356, NULL, true),
  ('00100107-0107-4107-a107-010701070107', 'c0500107-0107-4107-a107-010701070107', '15 Clarendon Avenue', NULL, 'Leamington Spa', 'CV32 4PZ', 52.2889, -1.5389, NULL, true),
  ('00100108-0108-4108-a108-010801080108', 'c0500108-0108-4108-a108-010801080108', '82 Warwick Street', NULL, 'Leamington Spa', 'CV32 5JY', 52.2856, -1.5423, NULL, true),
  ('00100109-0109-4109-a109-010901090109', 'c0500109-0109-4109-a109-010901090109', '31 Rugby Road', NULL, 'Leamington Spa', 'CV32 6PZ', 52.2823, -1.5456, NULL, true),
  ('00100110-0110-4110-a110-011001100110', 'c0500110-0110-4110-a110-011001100110', '56 Tachbrook Road', NULL, 'Leamington Spa', 'CV31 3EF', 52.2789, -1.5489, NULL, true),
  -- More Lichfield/Burntwood
  ('00100111-0111-4111-a111-011101110111', 'c0500111-0111-4111-a111-011101110111', '9 Bore Street', NULL, 'Lichfield', 'WS13 6LU', 52.6834, -1.8289, NULL, true),
  ('00100112-0112-4112-a112-011201120112', 'c0500112-0112-4112-a112-011201120112', '34 St John Street', NULL, 'Lichfield', 'WS13 6PB', 52.6867, -1.8256, NULL, true),
  ('00100113-0113-4113-a113-011301130113', 'c0500113-0113-4113-a113-011301130113', '57 Walsall Road', NULL, 'Lichfield', 'WS13 8AF', 52.6789, -1.8312, NULL, true),
  ('00100114-0114-4114-a114-011401140114', 'c0500114-0114-4114-a114-011401140114', '72 Birmingham Road', NULL, 'Lichfield', 'WS14 9BQ', 52.6756, -1.8345, NULL, true),
  ('00100115-0115-4115-a115-011501150115', 'c0500115-0115-4115-a115-011501150115', '15 Cannock Road', NULL, 'Burntwood', 'WS7 0BH', 52.6823, -1.9123, NULL, true),
  -- More Stafford Area
  ('00100116-0116-4116-a116-011601160116', 'c0500116-0116-4116-a116-011601160116', '28 Gaol Road', NULL, 'Stafford', 'ST16 3AQ', 52.8089, -2.1189, NULL, true),
  ('00100117-0117-4117-a117-011701170117', 'c0500117-0117-4117-a117-011701170117', '41 Newport Road', NULL, 'Stafford', 'ST16 1BB', 52.8112, -2.1156, NULL, true),
  ('00100118-0118-4118-a118-011801180118', 'c0500118-0118-4118-a118-011801180118', '64 Stone Road', NULL, 'Stafford', 'ST16 1NR', 52.8145, -2.1123, NULL, true),
  ('00100119-0119-4119-a119-011901190119', 'c0500119-0119-4119-a119-011901190119', '87 Wolverhampton Road', NULL, 'Stafford', 'ST17 4AW', 52.8023, -2.1245, NULL, true),
  ('00100120-0120-4120-a120-012001200120', 'c0500120-0120-4120-a120-012001200120', '19 Sandon Road', NULL, 'Stafford', 'ST16 3HA', 52.8178, -2.1089, NULL, true),
  -- Newport Area
  ('00100121-0121-4121-a121-012101210121', 'c0500121-0121-4121-a121-012101210121', '31 Wellington Road', NULL, 'Newport', 'TF10 7HE', 52.7689, -2.3789, NULL, true),
  ('00100122-0122-4122-a122-012201220122', 'c0500122-0122-4122-a122-012201220122', '46 High Street', NULL, 'Newport', 'TF10 7AT', 52.7712, -2.3756, NULL, true),
  ('00100123-0123-4123-a123-012301230123', 'c0500123-0123-4123-a123-012301230123', '69 Station Road', NULL, 'Newport', 'TF10 7EN', 52.7745, -2.3723, NULL, true),
  ('00100124-0124-4124-a124-012401240124', 'c0500124-0124-4124-a124-012401240124', '12 Stafford Street', NULL, 'Newport', 'TF10 7NU', 52.7656, -2.3812, NULL, true),
  ('00100125-0125-4125-a125-012501250125', 'c0500125-0125-4125-a125-012501250125', '85 Audley Avenue', NULL, 'Newport', 'TF10 7BT', 52.7623, -2.3845, NULL, true);

-- ============================================================================
-- LAWNS
-- Realistic sizes based on UK garden research (median 188sqm, range 40-500sqm)
-- Condition mix for testing different scenarios
-- ============================================================================
INSERT INTO lawns (id, property_id, name, area_sqm, lawn_condition, access_notes, is_active) VALUES
  -- Sutton Coldfield area
  ('1a001111-1111-4111-a111-111111111111', '00101111-1111-4111-a111-111111111111', 'Rear Garden', 145.00, 'good', NULL, true),
  ('1a002222-2222-4222-a222-222222222222', '00102222-2222-4222-a222-222222222222', 'Main Lawn', 85.50, 'fair', 'Some shade from oak tree', true),
  ('1a00aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '0010aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Back Garden', 178.00, 'good', NULL, true),
  ('1a000001-0001-4001-a001-000100010001', '00100001-0001-4001-a001-000100010001', 'Front Garden', 42.00, 'excellent', NULL, true),
  ('1a000001-0001-4001-a001-000100010002', '00100001-0001-4001-a001-000100010001', 'Back Garden', 125.00, 'excellent', NULL, true),
  ('1a000004-0004-4004-a004-000400040004', '00100004-0004-4004-a004-000400040004', 'Commercial Lawn', 320.00, 'good', 'Avoid lunchtime - staff use area', true),
  ('1a000007-0007-4007-a007-000700070007', '00100007-0007-4007-a007-000700070007', 'Main Lawn', 285.00, 'good', 'Leatherjacket history', true),
  ('1a006666-6666-4666-a666-666666666666', '00106666-6666-4666-a666-666666666666', 'Front Lawn', 38.00, 'fair', NULL, true),
  ('1a006666-6666-4666-a666-666666666667', '00106666-6666-4666-a666-666666666666', 'Back Lawn', 95.00, 'good', NULL, true),
  ('1a00dddd-dddd-4ddd-dddd-dddddddddddd', '0010dddd-dddd-4ddd-dddd-dddddddddddd', 'Main Lawn', 110.00, 'new', 'Established 2023 - still developing', true),

  -- Leamington Spa / Warwick area
  ('1a003333-3333-4333-a333-333333333333', '00103333-3333-4333-a333-333333333333', 'Garden Lawn', 165.00, 'good', NULL, true),
  ('1a004444-4444-4444-a444-444444444444', '00104444-4444-4444-a444-444444444444', 'Rear Lawn', 92.00, 'fair', 'Some moss in shaded area', true),
  ('1a00cccc-cccc-4ccc-cccc-cccccccccccc', '0010cccc-cccc-4ccc-cccc-cccccccccccc', 'Garden Lawn', 155.00, 'excellent', 'Customer maintains edges herself', true),
  ('1a000005-0005-4005-a005-000500050005', '00100005-0005-4005-a005-000500050005', 'Rear Garden', 135.00, 'good', NULL, true),
  ('1a009999-9999-4999-a999-999999999999', '00109999-9999-4999-a999-999999999999', 'Back Lawn', 175.00, 'good', NULL, true),
  ('1a000002-0002-4002-a002-000200020002', '00100002-0002-4002-a002-000200020002', 'Main Lawn', 210.00, 'good', NULL, true),
  ('1a000010-0010-4010-a010-001000100010', '00100010-0010-4010-a010-001000100010', 'North Garden', 125.00, 'fair', 'Heavy moss - north facing', true),

  -- Lichfield area
  ('1a008888-8888-4888-a888-888888888888', '00108888-8888-4888-a888-888888888888', 'Back Garden', 165.00, 'good', NULL, true),
  ('1a00eeee-eeee-4eee-eeee-eeeeeeeeeeee', '0010eeee-eeee-4eee-eeee-eeeeeeeeeeee', 'Garden Lawn', 142.00, 'good', NULL, true),
  ('1a000006-0006-4006-a006-000600060006', '00100006-0006-4006-a006-000600060006', 'Courtyard Lawn', 28.00, 'excellent', 'Very small - minimum charge', true),

  -- Stafford area
  ('1a00bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '0010bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'Rear Garden', 88.00, 'good', NULL, true),
  ('1a000003-0003-4003-a003-000300030003', '00100003-0003-4003-a003-000300030003', 'Back Lawn', 115.00, 'fair', 'Some bare patches', true),
  ('1a000009-0009-4009-a009-000900090009', '00100009-0009-4009-a009-000900090009', 'Main Lawn', 195.00, 'good', NULL, true),

  -- Rural/Larger properties
  ('1a005555-5555-4555-a555-555555555555', '00105555-5555-4555-a555-555555555555', 'Main Lawn', 380.00, 'good', 'Large lawn - allow extra time', true),
  ('1a007777-7777-4777-a777-777777777777', '00107777-7777-4777-a777-777777777777', 'Front Lawn', 245.00, 'good', NULL, true),
  ('1a007777-7777-4777-a777-777777777778', '00107777-7777-4777-a777-777777777777', 'Rear Lawn', 310.00, 'good', 'Croquet lawn - very particular customer', true),
  ('1a007777-7777-4777-a777-777777777779', '00107777-7777-4777-a777-777777777777', 'Side Garden', 85.00, 'fair', 'Shaded by hedge', true),
  ('1a00ffff-ffff-4fff-ffff-ffffffffffff', '0010ffff-ffff-4fff-ffff-ffffffffffff', 'Back Garden', 145.00, 'fair', 'Access via house only', true),
  ('1a000008-0008-4008-a008-000800080008', '00100008-0008-4008-a008-000800080008', 'Main Lawn', 275.00, 'good', 'Partial shade from mature oaks', true),
  -- Additional lawns for customers 26-125
  -- Solihull Area (typical suburban gardens 80-200 sqm)
  ('1a000026-0026-4026-a026-002600260026', '00100026-0026-4026-a026-002600260026', 'Rear Garden', 165.00, 'good', NULL, true),
  ('1a000027-0027-4027-a027-002700270027', '00100027-0027-4027-a027-002700270027', 'Main Lawn', 142.00, 'good', NULL, true),
  ('1a000028-0028-4028-a028-002800280028', '00100028-0028-4028-a028-002800280028', 'Back Garden', 98.00, 'fair', 'Some shade', true),
  ('1a000029-0029-4029-a029-002900290029', '00100029-0029-4029-a029-002900290029', 'Rear Lawn', 195.00, 'excellent', 'Golf club member - pristine lawn', true),
  ('1a000030-0030-4030-a030-003000300030', '00100030-0030-4030-a030-003000300030', 'Garden Lawn', 178.00, 'good', NULL, true),
  -- Coventry Area
  ('1a000031-0031-4031-a031-003100310031', '00100031-0031-4031-a031-003100310031', 'Main Lawn', 125.00, 'good', NULL, true),
  ('1a000032-0032-4032-a032-003200320032', '00100032-0032-4032-a032-003200320032', 'Back Garden', 110.00, 'good', 'Children play area', true),
  ('1a000033-0033-4033-a033-003300330033', '00100033-0033-4033-a033-003300330033', 'Rear Lawn', 145.00, 'fair', NULL, true),
  ('1a000034-0034-4034-a034-003400340034', '00100034-0034-4034-a034-003400340034', 'Garden Lawn', 168.00, 'good', NULL, true),
  ('1a000035-0035-4035-a035-003500350035', '00100035-0035-4035-a035-003500350035', 'Main Lawn', 135.00, 'good', NULL, true),
  -- Wolverhampton Area (mix of sizes)
  ('1a000036-0036-4036-a036-003600360036', '00100036-0036-4036-a036-003600360036', 'Rear Garden', 155.00, 'good', NULL, true),
  ('1a000037-0037-4037-a037-003700370037', '00100037-0037-4037-a037-003700370037', 'Victorian Garden', 285.00, 'good', 'Large period property', true),
  ('1a000038-0038-4038-a038-003800380038', '00100038-0038-4038-a038-003800380038', 'Back Lawn', 120.00, 'fair', NULL, true),
  ('1a000039-0039-4039-a039-003900390039', '00100039-0039-4039-a039-003900390039', 'Main Lawn', 175.00, 'good', 'Dog area separate', true),
  ('1a000040-0040-4040-a040-004000400040', '00100040-0040-4040-a040-004000400040', 'Garden Lawn', 198.00, 'good', NULL, true),
  -- Walsall Area
  ('1a000041-0041-4041-a041-004100410041', '00100041-0041-4041-a041-004100410041', 'Rear Garden', 88.00, 'good', NULL, true),
  ('1a000042-0042-4042-a042-004200420042', '00100042-0042-4042-a042-004200420042', 'Main Lawn', 125.00, 'excellent', 'Retired gardener', true),
  ('1a000043-0043-4043-a043-004300430043', '00100043-0043-4043-a043-004300430043', 'Back Garden', 165.00, 'good', NULL, true),
  ('1a000044-0044-4044-a044-004400440044', '00100044-0044-4044-a044-004400440044', 'Garden Lawn', 145.00, 'good', NULL, true),
  ('1a000045-0045-4045-a045-004500450045', '00100045-0045-4045-a045-004500450045', 'Rear Lawn', 112.00, 'fair', NULL, true),
  -- Dudley Area
  ('1a000046-0046-4046-a046-004600460046', '00100046-0046-4046-a046-004600460046', 'Main Lawn', 135.00, 'good', NULL, true),
  ('1a000047-0047-4047-a047-004700470047', '00100047-0047-4047-a047-004700470047', 'Traditional Garden', 225.00, 'good', 'Historic property', true),
  ('1a000048-0048-4048-a048-004800480048', '00100048-0048-4048-a048-004800480048', 'Back Garden', 78.00, 'fair', 'Small town garden', true),
  ('1a000049-0049-4049-a049-004900490049', '00100049-0049-4049-a049-004900490049', 'Rear Lawn', 168.00, 'good', NULL, true),
  ('1a000050-0050-4050-a050-005000500050', '00100050-0050-4050-a050-005000500050', 'Garden Lawn', 155.00, 'good', 'Organic only', true),
  -- Rugby Area
  ('1a000051-0051-4051-a051-005100510051', '00100051-0051-4051-a051-005100510051', 'Back Garden', 145.00, 'good', NULL, true),
  ('1a000052-0052-4052-a052-005200520052', '00100052-0052-4052-a052-005200520052', 'Main Lawn', 178.00, 'good', NULL, true),
  ('1a000053-0053-4053-a053-005300530053', '00100053-0053-4053-a053-005300530053', 'Rear Lawn', 132.00, 'fair', NULL, true),
  ('1a000054-0054-4054-a054-005400540054', '00100054-0054-4054-a054-005400540054', 'Garden Lawn', 115.00, 'good', NULL, true),
  ('1a000055-0055-4055-a055-005500550055', '00100055-0055-4055-a055-005500550055', 'Back Garden', 188.00, 'good', NULL, true),
  -- Tamworth Area
  ('1a000056-0056-4056-a056-005600560056', '00100056-0056-4056-a056-005600560056', 'Main Lawn', 125.00, 'good', NULL, true),
  ('1a000057-0057-4057-a057-005700570057', '00100057-0057-4057-a057-005700570057', 'Rear Garden', 158.00, 'fair', NULL, true),
  ('1a000058-0058-4058-a058-005800580058', '00100058-0058-4058-a058-005800580058', 'Back Lawn', 142.00, 'new', 'First year of treatment', true),
  ('1a000059-0059-4059-a059-005900590059', '00100059-0059-4059-a059-005900590059', 'Garden Lawn', 165.00, 'good', NULL, true),
  ('1a000060-0060-4060-a060-006000600060', '00100060-0060-4060-a060-006000600060', 'Rear Lawn', 135.00, 'good', NULL, true),
  -- Stratford-upon-Avon Area (typically larger gardens)
  ('1a000061-0061-4061-a061-006100610061', '00100061-0061-4061-a061-006100610061', 'B&B Garden', 245.00, 'excellent', 'Must look perfect for guests', true),
  ('1a000062-0062-4062-a062-006200620062', '00100062-0062-4062-a062-006200620062', 'Main Lawn', 185.00, 'good', NULL, true),
  ('1a000063-0063-4063-a063-006300630063', '00100063-0063-4063-a063-006300630063', 'Rear Garden', 212.00, 'good', NULL, true),
  ('1a000064-0064-4064-a064-006400640064', '00100064-0064-4064-a064-006400640064', 'Riverside Garden', 198.00, 'fair', 'Can be damp', true),
  ('1a000065-0065-4065-a065-006500650065', '00100065-0065-4065-a065-006500650065', 'Back Lawn', 175.00, 'good', NULL, true),
  -- More Birmingham Suburbs
  ('1a000066-0066-4066-a066-006600660066', '00100066-0066-4066-a066-006600660066', 'Main Lawn', 145.00, 'good', NULL, true),
  ('1a000067-0067-4067-a067-006700670067', '00100067-0067-4067-a067-006700670067', 'Rear Garden', 168.00, 'good', NULL, true),
  ('1a000068-0068-4068-a068-006800680068', '00100068-0068-4068-a068-006800680068', 'Back Garden', 95.00, 'fair', NULL, true),
  ('1a000069-0069-4069-a069-006900690069', '00100069-0069-4069-a069-006900690069', 'Small Lawn', 55.00, 'good', 'Victorian terrace', true),
  ('1a000070-0070-4070-a070-007000700070', '00100070-0070-4070-a070-007000700070', 'Garden Lawn', 132.00, 'good', NULL, true),
  -- Nuneaton Area
  ('1a000071-0071-4071-a071-007100710071', '00100071-0071-4071-a071-007100710071', 'Main Lawn', 145.00, 'good', NULL, true),
  ('1a000072-0072-4072-a072-007200720072', '00100072-0072-4072-a072-007200720072', 'Bungalow Garden', 165.00, 'good', 'Easy access', true),
  ('1a000073-0073-4073-a073-007300730073', '00100073-0073-4073-a073-007300730073', 'Rear Lawn', 178.00, 'fair', NULL, true),
  ('1a000074-0074-4074-a074-007400740074', '00100074-0074-4074-a074-007400740074', 'Back Garden', 125.00, 'good', NULL, true),
  ('1a000075-0075-4075-a075-007500750075', '00100075-0075-4075-a075-007500750075', 'Corner Plot', 195.00, 'good', 'Two lawn areas', true),
  -- Redditch Area
  ('1a000076-0076-4076-a076-007600760076', '00100076-0076-4076-a076-007600760076', 'Main Lawn', 142.00, 'good', NULL, true),
  ('1a000077-0077-4077-a077-007700770077', '00100077-0077-4077-a077-007700770077', 'Rear Garden', 155.00, 'fair', NULL, true),
  ('1a000078-0078-4078-a078-007800780078', '00100078-0078-4078-a078-007800780078', 'New Estate Lawn', 88.00, 'new', 'Young lawn', true),
  ('1a000079-0079-4079-a079-007900790079', '00100079-0079-4079-a079-007900790079', 'Back Lawn', 165.00, 'good', NULL, true),
  ('1a000080-0080-4080-a080-008000800080', '00100080-0080-4080-a080-008000800080', 'Garden Lawn', 135.00, 'good', NULL, true),
  -- Bromsgrove Area
  ('1a000081-0081-4081-a081-008100810081', '00100081-0081-4081-a081-008100810081', 'Town Garden', 95.00, 'good', 'Limited parking', true),
  ('1a000082-0082-4082-a082-008200820082', '00100082-0082-4082-a082-008200820082', 'Main Lawn', 175.00, 'good', NULL, true),
  ('1a000083-0083-4083-a083-008300830083', '00100083-0083-4083-a083-008300830083', 'Rear Garden', 145.00, 'fair', NULL, true),
  ('1a000084-0084-4084-a084-008400840084', '00100084-0084-4084-a084-008400840084', 'Rural Garden', 325.00, 'good', 'Large country garden', true),
  ('1a000085-0085-4085-a085-008500850085', '00100085-0085-4085-a085-008500850085', 'Back Lawn', 165.00, 'good', NULL, true),
  -- Halesowen Area
  ('1a000086-0086-4086-a086-008600860086', '00100086-0086-4086-a086-008600860086', 'Main Lawn', 132.00, 'good', NULL, true),
  ('1a000087-0087-4087-a087-008700870087', '00100087-0087-4087-a087-008700870087', 'Bowls Quality', 185.00, 'excellent', 'Flat lawn preferred', true),
  ('1a000088-0088-4088-a088-008800880088', '00100088-0088-4088-a088-008800880088', 'Back Garden', 112.00, 'good', NULL, true),
  ('1a000089-0089-4089-a089-008900890089', '00100089-0089-4089-a089-008900890089', 'Rear Lawn', 155.00, 'fair', NULL, true),
  ('1a000090-0090-4090-a090-009000900090', '00100090-0090-4090-a090-009000900090', 'Garden Lawn', 145.00, 'good', NULL, true),
  -- Stourbridge Area
  ('1a000091-0091-4091-a091-009100910091', '00100091-0091-4091-a091-009100910091', 'Main Lawn', 168.00, 'good', NULL, true),
  ('1a000092-0092-4092-a092-009200920092', '00100092-0092-4092-a092-009200920092', 'Rear Garden', 178.00, 'good', NULL, true),
  ('1a000093-0093-4093-a093-009300930093', '00100093-0093-4093-a093-009300930093', 'Back Lawn', 135.00, 'fair', NULL, true),
  ('1a000094-0094-4094-a094-009400940094', '00100094-0094-4094-a094-009400940094', 'Garden Lawn', 125.00, 'good', NULL, true),
  ('1a000095-0095-4095-a095-009500950095', '00100095-0095-4095-a095-009500950095', 'Park Adjacent', 212.00, 'good', 'Near Mary Stevens Park', true),
  -- Cannock Area (sandy soil typical)
  ('1a000096-0096-4096-a096-009600960096', '00100096-0096-4096-a096-009600960096', 'Main Lawn', 155.00, 'fair', 'Sandy soil', true),
  ('1a000097-0097-4097-a097-009700970097', '00100097-0097-4097-a097-009700970097', 'Rear Garden', 185.00, 'fair', 'Near Chase - sandy', true),
  ('1a000098-0098-4098-a098-009800980098', '00100098-0098-4098-a098-009800980098', 'Back Lawn', 142.00, 'good', NULL, true),
  ('1a000099-0099-4099-a099-009900990099', '00100099-0099-4099-a099-009900990099', 'Garden Lawn', 125.00, 'good', NULL, true),
  ('1a000100-0100-4100-a100-010001000100', '00100100-0100-4100-a100-010001000100', 'Main Lawn', 168.00, 'good', NULL, true),
  -- More Sutton Coldfield/Erdington
  ('1a000101-0101-4101-a101-010101010101', '00100101-0101-4101-a101-010101010101', 'Rear Garden', 112.00, 'good', NULL, true),
  ('1a000102-0102-4102-a102-010201020102', '00100102-0102-4102-a102-010201020102', 'Main Lawn', 145.00, 'good', 'Elderly customer', true),
  ('1a000103-0103-4103-a103-010301030103', '00100103-0103-4103-a103-010301030103', 'Back Garden', 178.00, 'fair', NULL, true),
  ('1a000104-0104-4104-a104-010401040104', '00100104-0104-4104-a104-010401040104', 'Park Edge', 195.00, 'good', 'Wildlife friendly', true),
  ('1a000105-0105-4105-a105-010501050105', '00100105-0105-4105-a105-010501050105', 'Rear Lawn', 165.00, 'good', NULL, true),
  -- More Leamington/Warwick (Regency properties often larger)
  ('1a000106-0106-4106-a106-010601060106', '00100106-0106-4106-a106-010601060106', 'Formal Garden', 265.00, 'excellent', 'Regency property', true),
  ('1a000107-0107-4107-a107-010701070107', '00100107-0107-4107-a107-010701070107', 'Main Lawn', 185.00, 'good', NULL, true),
  ('1a000108-0108-4108-a108-010801080108', '00100108-0108-4108-a108-010801080108', 'Rear Garden', 155.00, 'fair', NULL, true),
  ('1a000109-0109-4109-a109-010901090109', '00100109-0109-4109-a109-010901090109', 'Allotment Adjacent', 142.00, 'good', 'Organic gardener', true),
  ('1a000110-0110-4110-a110-011001100110', '00100110-0110-4110-a110-011001100110', 'Back Lawn', 175.00, 'good', NULL, true),
  -- More Lichfield/Burntwood
  ('1a000111-0111-4111-a111-011101110111', '00100111-0111-4111-a111-011101110111', 'Cathedral Close', 135.00, 'excellent', 'Historic area', true),
  ('1a000112-0112-4112-a112-011201120112', '00100112-0112-4112-a112-011201120112', 'Main Lawn', 145.00, 'good', NULL, true),
  ('1a000113-0113-4113-a113-011301130113', '00100113-0113-4113-a113-011301130113', 'Large Garden', 298.00, 'good', 'Full day job', true),
  ('1a000114-0114-4114-a114-011401140114', '00100114-0114-4114-a114-011401140114', 'Rear Lawn', 165.00, 'fair', NULL, true),
  ('1a000115-0115-4115-a115-011501150115', '00100115-0115-4115-a115-011501150115', 'New Build', 112.00, 'new', 'Good access', true),
  -- More Stafford Area
  ('1a000116-0116-4116-a116-011601160116', '00100116-0116-4116-a116-011601160116', 'Town Garden', 98.00, 'good', NULL, true),
  ('1a000117-0117-4117-a117-011701170117', '00100117-0117-4117-a117-011701170117', 'Main Lawn', 155.00, 'fair', NULL, true),
  ('1a000118-0118-4118-a118-011801180118', '00100118-0118-4118-a118-011801180118', 'Showground Area', 185.00, 'good', NULL, true),
  ('1a000119-0119-4119-a119-011901190119', '00100119-0119-4119-a119-011901190119', 'Rear Garden', 168.00, 'good', NULL, true),
  ('1a000120-0120-4120-a120-012001200120', '00100120-0120-4120-a120-012001200120', 'Back Lawn', 142.00, 'good', NULL, true),
  -- Newport Area (edge of service area)
  ('1a000121-0121-4121-a121-012101210121', '00100121-0121-4121-a121-012101210121', 'Main Lawn', 175.00, 'good', 'Extra travel', true),
  ('1a000122-0122-4122-a122-012201220122', '00100122-0122-4122-a122-012201220122', 'Rear Garden', 145.00, 'good', NULL, true),
  ('1a000123-0123-4123-a123-012301230123', '00100123-0123-4123-a123-012301230123', 'Back Lawn', 165.00, 'fair', NULL, true),
  ('1a000124-0124-4124-a124-012401240124', '00100124-0124-4124-a124-012401240124', 'Town Garden', 125.00, 'good', 'Historic town', true),
  ('1a000125-0125-4125-a125-012501250125', '00100125-0125-4125-a125-012501250125', 'Edge of Catchment', 155.00, 'good', 'Last in area', true);

-- ============================================================================
-- TREATMENT PLANS (Annual subscription plans)
-- Mix of Basic (5 core treatments), Standard (+scarify/aerate), Ultimate (+overseed/t000e0000dress)
-- Plans for 2024 (completed) and 2025 (active)
-- ============================================================================

-- Helper function to calculate treatment price
CREATE OR REPLACE FUNCTION calc_treatment_price(area_sqm DECIMAL, price_per_sqm DECIMAL, min_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN GREATEST(area_sqm * price_per_sqm, min_price);
END;
$$ LANGUAGE plpgsql;

-- 2024 Plans (mostly completed)
INSERT INTO treatment_plans (id, lawn_id, year, status, total_estimated_price, notes) VALUES
  ('01a01111-2024-4111-a111-111111111111', '1a001111-1111-4111-a111-111111111111', 2024, 'completed', 185.50, 'Standard programme'),
  ('01a02222-2024-4222-a222-222222222222', '1a002222-2222-4222-a222-222222222222', 2024, 'completed', 168.00, 'Basic programme - moss issues'),
  ('01a03333-2024-4333-a333-333333333333', '1a003333-3333-4333-a333-333333333333', 2024, 'completed', 195.00, 'Standard programme'),
  ('01a05555-2024-4555-a555-555555555555', '1a005555-5555-4555-a555-555555555555', 2024, 'completed', 485.00, 'Ultimate programme - large lawn'),
  ('01a07777-2024-4777-a777-777777777778', '1a007777-7777-4777-a777-777777777778', 2024, 'completed', 420.00, 'Ultimate programme - croquet lawn'),
  ('01a0aaaa-2024-4aaa-aaaa-aaaaaaaaaaaa', '1a00aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 2024, 'completed', 225.00, 'Standard programme'),
  ('01a0cccc-2024-4ccc-cccc-cccccccccccc', '1a00cccc-cccc-4ccc-cccc-cccccccccccc', 2024, 'completed', 175.00, 'Basic programme'),
  ('01a00007-2024-4007-a007-000700070007', '1a000007-0007-4007-a007-000700070007', 2024, 'completed', 395.00, 'Standard + leatherjacket treatment');

-- 2025 Plans (active)
INSERT INTO treatment_plans (id, lawn_id, year, status, total_estimated_price, notes) VALUES
  ('01a01111-2025-4111-a111-111111111111', '1a001111-1111-4111-a111-111111111111', 2025, 'active', 192.00, 'Standard programme - renewed'),
  ('01a02222-2025-4222-a222-222222222222', '1a002222-2222-4222-a222-222222222222', 2025, 'active', 175.00, 'Standard programme - upgraded from basic'),
  ('01a03333-2025-4333-a333-333333333333', '1a003333-3333-4333-a333-333333333333', 2025, 'active', 198.00, 'Standard programme'),
  ('01a04444-2025-4444-a444-444444444444', '1a004444-4444-4444-a444-444444444444', 2025, 'active', 165.00, 'Basic programme with moss treatment'),
  ('01a05555-2025-4555-a555-555555555555', '1a005555-5555-4555-a555-555555555555', 2025, 'active', 498.00, 'Ultimate programme'),
  ('01a0666a-2025-4666-a666-666666666666', '1a006666-6666-4666-a666-666666666666', 2025, 'active', 145.00, 'Basic programme - front lawn'),
  ('01a0666b-2025-4666-a666-666666666667', '1a006666-6666-4666-a666-666666666667', 2025, 'active', 158.00, 'Basic programme - back lawn'),
  ('01a07777-2025-4777-a777-777777777777', '1a007777-7777-4777-a777-777777777777', 2025, 'active', 298.00, 'Standard programme - front lawn'),
  ('01a07777-2025-4777-a777-777777777778', '1a007777-7777-4777-a777-777777777778', 2025, 'active', 435.00, 'Ultimate programme - croquet lawn'),
  ('01a08888-2025-4888-a888-888888888888', '1a008888-8888-4888-a888-888888888888', 2025, 'active', 188.00, 'Standard programme'),
  ('01a09999-2025-4999-a999-999999999999', '1a009999-9999-4999-a999-999999999999', 2025, 'active', 205.00, 'Standard programme'),
  ('01a0aaaa-2025-4aaa-aaaa-aaaaaaaaaaaa', '1a00aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 2025, 'active', 232.00, 'Standard programme'),
  ('01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '1a00bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 2025, 'active', 142.00, 'Basic programme'),
  ('01a0cccc-2025-4ccc-cccc-cccccccccccc', '1a00cccc-cccc-4ccc-cccc-cccccccccccc', 2025, 'active', 245.00, 'Ultimate programme - keen gardener'),
  ('01a0dddd-2025-4ddd-dddd-dddddddddddd', '1a00dddd-dddd-4ddd-dddd-dddddddddddd', 2025, 'active', 165.00, 'Basic programme + overseeding'),
  ('01a0eeee-2025-4eee-eeee-eeeeeeeeeeee', '1a00eeee-eeee-4eee-eeee-eeeeeeeeeeee', 2025, 'active', 178.00, 'Standard programme'),
  ('01a0001a-2025-4001-a001-000100010001', '1a000001-0001-4001-a001-000100010001', 2025, 'active', 135.00, 'Ultimate - front garden'),
  ('01a0001b-2025-4001-a001-000100010002', '1a000001-0001-4001-a001-000100010002', 2025, 'active', 285.00, 'Ultimate - back garden'),
  ('01a00002-2025-4002-a002-000200020002', '1a000002-0002-4002-a002-000200020002', 2025, 'active', 265.00, 'Standard programme'),
  ('01a00004-2025-4004-a004-000400040004', '1a000004-0004-4004-a004-000400040004', 2025, 'active', 385.00, 'Standard programme - commercial'),
  ('01a00007-2025-4007-a007-000700070007', '1a000007-0007-4007-a007-000700070007', 2025, 'active', 412.00, 'Standard + leatherjacket treatment'),
  ('01a00008-2025-4008-a008-000800080008', '1a000008-0008-4008-a008-000800080008', 2025, 'active', 335.00, 'Standard programme - large lawn'),
  ('01a00010-2025-4010-a010-001000100010', '1a000010-0010-4010-a010-001000100010', 2025, 'active', 195.00, 'Standard + heavy moss treatment');

-- ============================================================================
-- TREATMENT PLAN ITEMS (Scheduled treatments within plans)
-- Creating items for 2025 active plans with realistic scheduling
-- ============================================================================

-- Standard programme items for 01a01111-2025 (145sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  -- Core treatments
  ('e0101111-2025-4001-a001-000000000001', '01a01111-2025-4111-a111-111111111111', '00011111-1111-4111-a111-111111111111', '2025-03-10', '2026-02-23', '2025-03-31', 31.90, false),
  ('e0101111-2025-4001-a001-000000000002', '01a01111-2025-4111-a111-111111111111', '00022222-2222-4222-a222-222222222222', '2025-05-12', '2025-04-28', '2025-05-31', 29.00, false),
  ('e0101111-2025-4001-a001-000000000003', '01a01111-2025-4111-a111-111111111111', '00033333-3333-4333-a333-333333333333', '2025-07-07', '2025-06-23', '2025-07-31', 31.90, false),
  ('e0101111-2025-4001-a001-000000000004', '01a01111-2025-4111-a111-111111111111', '00044444-4444-4444-a444-444444444444', '2025-09-01', '2025-08-18', '2025-09-30', 29.00, false),
  ('e0101111-2025-4001-a001-000000000005', '01a01111-2025-4111-a111-111111111111', '00055555-5555-4555-a555-555555555555', '2025-11-10', '2025-10-27', '2025-12-15', 34.80, false),
  -- Standard additions
  ('e0101111-2025-4001-a001-000000000006', '01a01111-2025-4111-a111-111111111111', '00066666-6666-4666-a666-666666666666', '2025-09-15', '2025-09-01', '2025-10-15', 65.25, false),
  ('e0101111-2025-4001-a001-000000000007', '01a01111-2025-4111-a111-111111111111', '00077777-7777-4777-a777-777777777777', '2025-04-07', '2025-03-24', '2025-04-30', 55.10, false);

-- Basic programme items for 01a0bbbb-2025 (88sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  ('e010bbbb-2025-4001-a001-000000000001', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00011111-1111-4111-a111-111111111111', '2025-03-17', '2026-03-02', '2025-04-07', 28.00, false),
  ('e010bbbb-2025-4001-a001-000000000002', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00022222-2222-4222-a222-222222222222', '2025-05-19', '2025-05-05', '2025-06-07', 26.00, false),
  ('e010bbbb-2025-4001-a001-000000000003', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00033333-3333-4333-a333-333333333333', '2025-07-14', '2025-06-30', '2025-08-07', 28.00, false),
  ('e010bbbb-2025-4001-a001-000000000004', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00044444-4444-4444-a444-444444444444', '2025-09-08', '2025-08-25', '2025-10-07', 26.00, false),
  ('e010bbbb-2025-4001-a001-000000000005', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00055555-5555-4555-a555-555555555555', '2025-11-17', '2025-11-03', '2025-12-15', 30.00, false);

-- Ultimate programme items for 01a05555-2025 (380sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  -- Core treatments
  ('e0105555-2025-4001-a001-000000000001', '01a05555-2025-4555-a555-555555555555', '00011111-1111-4111-a111-111111111111', '2026-03-02', '2025-02-17', '2025-03-24', 83.60, false),
  ('e0105555-2025-4001-a001-000000000002', '01a05555-2025-4555-a555-555555555555', '00022222-2222-4222-a222-222222222222', '2025-05-05', '2025-04-21', '2025-05-26', 76.00, false),
  ('e0105555-2025-4001-a001-000000000003', '01a05555-2025-4555-a555-555555555555', '00033333-3333-4333-a333-333333333333', '2025-06-30', '2025-06-16', '2025-07-21', 83.60, false),
  ('e0105555-2025-4001-a001-000000000004', '01a05555-2025-4555-a555-555555555555', '00044444-4444-4444-a444-444444444444', '2025-08-25', '2025-08-11', '2025-09-15', 76.00, false),
  ('e0105555-2025-4001-a001-000000000005', '01a05555-2025-4555-a555-555555555555', '00055555-5555-4555-a555-555555555555', '2025-11-03', '2025-10-20', '2025-12-01', 91.20, false),
  -- Ultimate additions
  ('e0105555-2025-4001-a001-000000000006', '01a05555-2025-4555-a555-555555555555', '00066666-6666-4666-a666-666666666666', '2025-09-08', '2025-08-25', '2025-10-06', 171.00, false),
  ('e0105555-2025-4001-a001-000000000007', '01a05555-2025-4555-a555-555555555555', '00077777-7777-4777-a777-777777777777', '2025-03-24', '2025-03-10', '2025-04-21', 144.40, false),
  ('e0105555-2025-4001-a001-000000000008', '01a05555-2025-4555-a555-555555555555', '00088888-8888-4888-a888-888888888888', '2025-09-22', '2025-09-08', '2025-10-20', 133.00, false),
  ('e0105555-2025-4001-a001-000000000009', '01a05555-2025-4555-a555-555555555555', '00099999-9999-4999-a999-999999999999', '2025-09-29', '2025-09-15', '2025-10-27', 209.00, false);

-- Moss problem plan for 01a00010-2025 (125sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  ('e0100010-2025-4001-a001-000000000001', '01a00010-2025-4010-a010-001000100010', '000ddddd-dddd-4ddd-dddd-dddddddddddd', '2026-02-23', '2025-02-10', '2025-03-17', 38.00, false),
  ('e0100010-2025-4001-a001-000000000002', '01a00010-2025-4010-a010-001000100010', '00011111-1111-4111-a111-111111111111', '2025-03-17', '2026-03-02', '2025-04-07', 28.00, false),
  ('e0100010-2025-4001-a001-000000000003', '01a00010-2025-4010-a010-001000100010', '00022222-2222-4222-a222-222222222222', '2025-05-19', '2025-05-05', '2025-06-07', 26.00, false),
  ('e0100010-2025-4001-a001-000000000004', '01a00010-2025-4010-a010-001000100010', '00033333-3333-4333-a333-333333333333', '2025-07-14', '2025-06-30', '2025-08-07', 28.00, false),
  ('e0100010-2025-4001-a001-000000000005', '01a00010-2025-4010-a010-001000100010', '00044444-4444-4444-a444-444444444444', '2025-09-08', '2025-08-25', '2025-10-07', 26.00, false),
  ('e0100010-2025-4001-a001-000000000006', '01a00010-2025-4010-a010-001000100010', '00055555-5555-4555-a555-555555555555', '2025-11-17', '2025-11-03', '2025-12-15', 30.00, false),
  ('e0100010-2025-4001-a001-000000000007', '01a00010-2025-4010-a010-001000100010', '00066666-6666-4666-a666-666666666666', '2025-09-22', '2025-09-08', '2025-10-20', 56.25, false),
  ('e0100010-2025-4001-a001-000000000008', '01a00010-2025-4010-a010-001000100010', '00077777-7777-4777-a777-777777777777', '2025-04-07', '2025-03-24', '2025-04-28', 55.00, false);

-- Leatherjacket treatment plan for 01a00007-2025 (285sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  ('e0100007-2025-4001-a001-000000000001', '01a00007-2025-4007-a007-000700070007', '00011111-1111-4111-a111-111111111111', '2025-03-10', '2026-02-23', '2025-03-31', 62.70, false),
  ('e0100007-2025-4001-a001-000000000002', '01a00007-2025-4007-a007-000700070007', '00022222-2222-4222-a222-222222222222', '2025-05-12', '2025-04-28', '2025-05-31', 57.00, false),
  ('e0100007-2025-4001-a001-000000000003', '01a00007-2025-4007-a007-000700070007', '00033333-3333-4333-a333-333333333333', '2025-07-07', '2025-06-23', '2025-07-31', 62.70, false),
  ('e0100007-2025-4001-a001-000000000004', '01a00007-2025-4007-a007-000700070007', '000aaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '2025-08-25', '2025-08-11', '2025-09-15', 114.00, false),
  ('e0100007-2025-4001-a001-000000000005', '01a00007-2025-4007-a007-000700070007', '00044444-4444-4444-a444-444444444444', '2025-09-15', '2025-09-01', '2025-10-06', 57.00, false),
  ('e0100007-2025-4001-a001-000000000006', '01a00007-2025-4007-a007-000700070007', '00055555-5555-4555-a555-555555555555', '2025-11-10', '2025-10-27', '2025-12-08', 68.40, false),
  ('e0100007-2025-4001-a001-000000000007', '01a00007-2025-4007-a007-000700070007', '00066666-6666-4666-a666-666666666666', '2025-09-29', '2025-09-15', '2025-10-27', 128.25, false),
  ('e0100007-2025-4001-a001-000000000008', '01a00007-2025-4007-a007-000700070007', '00077777-7777-4777-a777-777777777777', '2025-04-07', '2025-03-24', '2025-04-28', 108.30, false);

-- ============================================================================
-- ROUTES (Daily operator schedules)
-- Mix of completed, in-progress, and upcoming routes
-- ============================================================================
INSERT INTO routes (id, operator_id, vehicle_id, depot_id, route_date, status, estimated_distance_miles, actual_distance_miles, estimated_duration_minutes, actual_duration_minutes, started_at, completed_at, notes) VALUES
  -- Completed routes from December 2024
  ('12021202-0001-4001-a001-120212020001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2025-12-01', 'completed', 45.5, 47.2, 360, 385, '2025-12-01 08:30:00+00', '2025-12-01 15:05:00+00', 'Autumn feed round - Sutton area'),
  ('12031203-0001-4001-a001-120312030001', '0e002222-2222-4222-a222-222222222222', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2025-12-02', 'completed', 38.2, 39.8, 320, 335, '2025-12-02 08:45:00+00', '2025-12-02 14:25:00+00', 'Erdington/Sutton mixed'),
  ('12091209-0001-4001-a001-120912090001', '0e003333-3333-4333-a333-333333333333', '0e0a3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', '2025-12-08', 'completed', 52.3, 54.1, 390, 410, '2025-12-08 08:15:00+00', '2025-12-08 15:30:00+00', 'Leamington/Warwick round'),
  ('12161216-0001-4001-a001-121612160001', '0e005555-5555-4555-a555-555555555555', '0e0a5555-5555-4555-a555-555555555555', '33333333-3333-4333-a333-333333333333', '2025-12-15', 'completed', 42.8, 44.5, 340, 358, '2025-12-15 08:30:00+00', '2025-12-15 14:55:00+00', 'Stafford area winter feed'),

  -- Routes for early January 2025 (scheduled/upcoming)
  ('01060106-0001-4001-a001-010601060001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2026-01-05', 'confirmed', 48.0, NULL, 375, NULL, NULL, NULL, 'Winter feed - Sutton Coldfield'),
  ('01070107-0001-4001-a001-010701070001', '0e003333-3333-4333-a333-333333333333', '0e0a3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', '2026-01-06', 'confirmed', 55.0, NULL, 410, NULL, NULL, NULL, 'Winter feed - Leamington/Warwick'),
  ('01080108-0001-4001-a001-010801080001', '0e005555-5555-4555-a555-555555555555', '0e0a5555-5555-4555-a555-555555555555', '33333333-3333-4333-a333-333333333333', '2026-01-07', 'confirmed', 44.0, NULL, 350, NULL, NULL, NULL, 'Winter feed - Stafford'),
  ('01130113-0001-4001-a001-011301130001', '0e002222-2222-4222-a222-222222222222', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2026-01-12', 'draft', 41.0, NULL, 340, NULL, NULL, NULL, 'Lichfield area'),

  -- Upcoming spring routes (draft)
  ('02240224-0001-4001-a001-022402240001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2026-02-23', 'draft', 50.0, NULL, 400, NULL, NULL, NULL, 'Early spring - moss treatment round'),
  ('03030303-0001-4001-a001-030303030001', '0e006666-6666-4666-a666-666666666666', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2026-03-02', 'draft', 46.0, NULL, 380, NULL, NULL, NULL, 'Spring feed round 1');

-- ============================================================================
-- JOBS (Actual work performed)
-- Mix of completed jobs from 2024 and scheduled for 2025
-- ============================================================================
INSERT INTO jobs (id, job_number, lawn_id, route_stop_id, treatment_plan_item_id, status, scheduled_date, started_at, completed_at, performed_by, lawn_area_sqm, lawn_condition_at_job, before_notes, after_notes) VALUES
  -- Completed December 2024 jobs
  ('12020201-0001-4001-a001-120202010001', 'JOB-20241202-001', '1a001111-1111-4111-a111-111111111111', NULL, NULL, 'completed', '2025-12-01', '2025-12-01 09:15:00+00', '2025-12-01 09:45:00+00', '0e001111-1111-4111-a111-111111111111', 145.00, 'good', 'Lawn in good condition despite autumn weather', 'Applied autumn/winter feed. Customer pleased with lawn condition.'),
  ('12020201-0002-4002-a002-120202010002', 'JOB-20241202-002', '1a00aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'completed', '2025-12-01', '2025-12-01 10:30:00+00', '2025-12-01 11:05:00+00', '0e001111-1111-4111-a111-111111111111', 178.00, 'good', 'Dog was inside as requested', 'Autumn feed applied. Slight moss starting in corner - mentioned to customer.'),
  ('12020201-0003-4003-a003-120202010003', 'JOB-20241202-003', '1a000007-0007-4007-a007-000700070007', NULL, NULL, 'completed', '2025-12-01', '2025-12-01 11:45:00+00', '2025-12-01 12:35:00+00', '0e001111-1111-4111-a111-111111111111', 285.00, 'good', 'Large lawn. No signs of leatherjacket activity currently.', 'Winter feed applied. Lawn looking healthy going into winter.'),
  ('12030301-0001-4001-a001-120303010001', 'JOB-20241203-001', '1a006666-6666-4666-a666-666666666666', NULL, NULL, 'completed', '2025-12-02', '2025-12-02 09:00:00+00', '2025-12-02 09:20:00+00', '0e002222-2222-4222-a222-222222222222', 38.00, 'fair', 'Small front lawn', 'Applied winter feed. Discussed upgrading to standard programme for 2025.'),
  ('12030301-0002-4002-a002-120303010002', 'JOB-20241203-002', '1a006666-6666-4666-a666-666666666667', NULL, NULL, 'completed', '2025-12-02', '2025-12-02 09:25:00+00', '2025-12-02 09:50:00+00', '0e002222-2222-4222-a222-222222222222', 95.00, 'good', 'Back lawn in better condition than front', 'Winter feed applied successfully.'),
  ('12030301-0003-4003-a003-120303010003', 'JOB-20241203-003', '1a00dddd-dddd-4ddd-dddd-dddddddddddd', NULL, NULL, 'completed', '2025-12-02', '2025-12-02 10:30:00+00', '2025-12-02 11:00:00+00', '0e002222-2222-4222-a222-222222222222', 110.00, 'new', 'New lawn from 2023 - establishing well', 'Applied light winter feed. Lawn looking good for age.'),
  ('12090901-0001-4001-a001-120909010001', 'JOB-20241209-001', '1a003333-3333-4333-a333-333333333333', NULL, NULL, 'completed', '2025-12-08', '2025-12-08 08:45:00+00', '2025-12-08 09:30:00+00', '0e003333-3333-4333-a333-333333333333', 165.00, 'good', 'Key under plant pot - access successful', 'Autumn/winter feed. Lawn in excellent condition.'),
  ('12090901-0002-4002-a002-120909010002', 'JOB-20241209-002', '1a004444-4444-4444-a444-444444444444', NULL, NULL, 'completed', '2025-12-08', '2025-12-08 10:15:00+00', '2025-12-08 10:50:00+00', '0e003333-3333-4333-a333-333333333333', 92.00, 'fair', 'Knocked loudly - customer answered', 'Winter feed with extra moss control. Will need heavy treatment in spring.'),
  ('12090901-0003-4003-a003-120909010003', 'JOB-20241209-003', '1a00cccc-cccc-4ccc-cccc-cccccccccccc', NULL, NULL, 'completed', '2025-12-08', '2025-12-08 11:30:00+00', '2025-12-08 12:15:00+00', '0e003333-3333-4333-a333-333333333333', 155.00, 'excellent', 'Customer was in garden - discussed lawn care', 'Winter feed. Customer maintains beautiful lawn edges.'),
  ('12160601-0001-4001-a001-121606010001', 'JOB-20241216-001', '1a00bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'completed', '2025-12-15', '2025-12-15 09:00:00+00', '2025-12-15 09:30:00+00', '0e005555-5555-4555-a555-555555555555', 88.00, 'good', 'Access straightforward', 'Winter feed applied.'),
  ('12160601-0002-4002-a002-121606010002', 'JOB-20241216-002', '1a000003-0003-4003-a003-000300030003', NULL, NULL, 'completed', '2025-12-15', '2025-12-15 10:15:00+00', '2025-12-15 10:50:00+00', '0e005555-5555-4555-a555-555555555555', 115.00, 'fair', 'Saturday appointment as requested', 'Winter feed. Bare patches noted - recommend overseeding in autumn 2025.'),
  ('12160601-0003-4003-a003-121606010003', 'JOB-20241216-003', '1a000009-0009-4009-a009-000900090009', NULL, NULL, 'completed', '2025-12-15', '2025-12-15 11:30:00+00', '2025-12-15 12:15:00+00', '0e005555-5555-4555-a555-555555555555', 195.00, 'good', 'Large lawn - allowed extra time', 'Winter feed applied. Lawn in good health.'),

  -- Scheduled jobs for January 2025
  ('01060601-0001-4001-a001-010606010001', 'JOB-20250106-001', '1a002222-2222-4222-a222-222222222222', NULL, NULL, 'scheduled', '2026-01-05', NULL, NULL, NULL, 85.50, NULL, NULL, NULL),
  ('01060601-0002-4002-a002-010606010002', 'JOB-20250106-002', '1a000001-0001-4001-a001-000100010001', NULL, NULL, 'scheduled', '2026-01-05', NULL, NULL, NULL, 42.00, NULL, NULL, NULL),
  ('01060601-0003-4003-a003-010606010003', 'JOB-20250106-003', '1a000001-0001-4001-a001-000100010002', NULL, NULL, 'scheduled', '2026-01-05', NULL, NULL, NULL, 125.00, NULL, NULL, NULL),
  ('01070701-0001-4001-a001-010707010001', 'JOB-20250107-001', '1a009999-9999-4999-a999-999999999999', NULL, NULL, 'scheduled', '2026-01-06', NULL, NULL, NULL, 175.00, NULL, NULL, NULL),
  ('01070701-0002-4002-a002-010707010002', 'JOB-20250107-002', '1a000002-0002-4002-a002-000200020002', NULL, NULL, 'scheduled', '2026-01-06', NULL, NULL, NULL, 210.00, NULL, NULL, NULL),
  ('01070701-0003-4003-a003-010707010003', 'JOB-20250107-003', '1a000005-0005-4005-a005-000500050005', NULL, NULL, 'scheduled', '2026-01-06', NULL, NULL, NULL, 135.00, NULL, NULL, NULL),
  ('01080801-0001-4001-a001-010808010001', 'JOB-20250108-001', '1a000008-0008-4008-a008-000800080008', NULL, NULL, 'scheduled', '2026-01-07', NULL, NULL, NULL, 275.00, NULL, NULL, NULL);

-- ============================================================================
-- JOB TREATMENTS (Treatments performed during jobs)
-- ============================================================================
INSERT INTO job_treatments (id, job_id, treatment_id, price_charged, duration_minutes) VALUES
  -- December 2024 completed jobs
  ('a0001202-0001-4001-a001-120201010001', '12020201-0001-4001-a001-120202010001', '00055555-5555-4555-a555-555555555555', 34.80, 25),
  ('a0001202-0002-4002-a002-120201010002', '12020201-0002-4002-a002-120202010002', '00055555-5555-4555-a555-555555555555', 42.72, 30),
  ('a0001202-0003-4003-a003-120201010003', '12020201-0003-4003-a003-120202010003', '00055555-5555-4555-a555-555555555555', 68.40, 45),
  ('a0001203-0001-4001-a001-120301010001', '12030301-0001-4001-a001-120303010001', '00055555-5555-4555-a555-555555555555', 30.00, 15),
  ('a0001203-0002-4002-a002-120301010002', '12030301-0002-4002-a002-120303010002', '00055555-5555-4555-a555-555555555555', 30.00, 20),
  ('a0001203-0003-4003-a003-120301010003', '12030301-0003-4003-a003-120303010003', '00055555-5555-4555-a555-555555555555', 30.00, 25),
  ('a0001209-0001-4001-a001-120901010001', '12090901-0001-4001-a001-120909010001', '00055555-5555-4555-a555-555555555555', 39.60, 35),
  ('a0001209-0002-4002-a002-120901010002', '12090901-0002-4002-a002-120909010002', '00055555-5555-4555-a555-555555555555', 30.00, 25),
  ('a0001209-0003-4003-a003-120901010003', '12090901-0003-4003-a003-120909010003', '00055555-5555-4555-a555-555555555555', 37.20, 35),
  ('a0001216-0001-4001-a001-121601010001', '12160601-0001-4001-a001-121606010001', '00055555-5555-4555-a555-555555555555', 30.00, 20),
  ('a0001216-0002-4002-a002-121601010002', '12160601-0002-4002-a002-121606010002', '00055555-5555-4555-a555-555555555555', 30.00, 25),
  ('a0001216-0003-4003-a003-121601010003', '12160601-0003-4003-a003-121606010003', '00055555-5555-4555-a555-555555555555', 46.80, 35);

-- ============================================================================
-- INVOICES
-- Monthly invoices for December 2024 completed work
-- Mix of paid and pending statuses
-- ============================================================================
INSERT INTO invoices (id, invoice_number, customer_id, status, issue_date, due_date, subtotal, vat_rate, vat_amount, total_amount, amount_paid, payment_terms_days, notes) VALUES
  ('10e02024-1200-4001-a001-000000000001', 'INV-2024-00145', 'c0501111-1111-4111-a111-111111111111', 'paid', '2025-12-05', '2026-01-04', 34.80, 20.00, 6.96, 41.76, 41.76, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000002', 'INV-2024-00146', 'c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'paid', '2025-12-05', '2026-01-04', 42.72, 20.00, 8.54, 51.26, 51.26, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000003', 'INV-2024-00147', 'c0500007-0007-4007-a007-000700070007', 'paid', '2025-12-05', '2026-01-04', 68.40, 20.00, 13.68, 82.08, 82.08, 30, 'December treatment - leatherjacket property'),
  ('10e02024-1200-4001-a001-000000000004', 'INV-2024-00148', 'c0506666-6666-4666-a666-666666666666', 'paid', '2025-12-06', '2026-01-05', 60.00, 20.00, 12.00, 72.00, 72.00, 30, 'December treatment - both lawns'),
  ('10e02024-1200-4001-a001-000000000005', 'INV-2024-00149', 'c050dddd-dddd-4ddd-dddd-dddddddddddd', 'sent', '2025-12-06', '2026-01-05', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000006', 'INV-2024-00150', 'c0503333-3333-4333-a333-333333333333', 'paid', '2025-12-12', '2026-01-11', 39.60, 20.00, 7.92, 47.52, 47.52, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000007', 'INV-2024-00151', 'c0504444-4444-4444-a444-444444444444', 'sent', '2025-12-12', '2026-01-11', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000008', 'INV-2024-00152', 'c050cccc-cccc-4ccc-cccc-cccccccccccc', 'paid', '2025-12-12', '2026-01-11', 37.20, 20.00, 7.44, 44.64, 44.64, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000009', 'INV-2024-00153', 'c050bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'sent', '2025-12-18', '2026-01-17', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000010', 'INV-2024-00154', 'c0500003-0003-4003-a003-000300030003', 'sent', '2025-12-18', '2026-01-17', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000011', 'INV-2024-00155', 'c0500009-0009-4009-a009-000900090009', 'paid', '2025-12-18', '2026-01-17', 46.80, 20.00, 9.36, 56.16, 56.16, 30, 'December treatment');

-- ============================================================================
-- INVOICE ITEMS
-- Line items for invoices
-- ============================================================================
INSERT INTO invoice_items (id, invoice_id, job_id, description, quantity, unit_price, line_total) VALUES
  ('10e11200-0101-4001-a001-000100010001', '10e02024-1200-4001-a001-000000000001', '12020201-0001-4001-a001-120202010001', 'Autumn/Winter Feed - 145sqm', 1, 34.80, 34.80),
  ('10e11200-0201-4002-a002-000200020001', '10e02024-1200-4001-a001-000000000002', '12020201-0002-4002-a002-120202010002', 'Autumn/Winter Feed - 178sqm', 1, 42.72, 42.72),
  ('10e11200-0301-4003-a003-000300030001', '10e02024-1200-4001-a001-000000000003', '12020201-0003-4003-a003-120202010003', 'Autumn/Winter Feed - 285sqm', 1, 68.40, 68.40),
  ('10e11200-0401-4004-a004-000400040001', '10e02024-1200-4001-a001-000000000004', '12030301-0001-4001-a001-120303010001', 'Autumn/Winter Feed - Front Lawn 38sqm', 1, 30.00, 30.00),
  ('10e11200-0402-4004-a004-000400040002', '10e02024-1200-4001-a001-000000000004', '12030301-0002-4002-a002-120303010002', 'Autumn/Winter Feed - Back Lawn 95sqm', 1, 30.00, 30.00),
  ('10e11200-0501-4005-a005-000500050001', '10e02024-1200-4001-a001-000000000005', '12030301-0003-4003-a003-120303010003', 'Autumn/Winter Feed - 110sqm (new lawn)', 1, 30.00, 30.00),
  ('10e11200-0601-4006-a006-000600060001', '10e02024-1200-4001-a001-000000000006', '12090901-0001-4001-a001-120909010001', 'Autumn/Winter Feed - 165sqm', 1, 39.60, 39.60),
  ('10e11200-0701-4007-a007-000700070001', '10e02024-1200-4001-a001-000000000007', '12090901-0002-4002-a002-120909010002', 'Autumn/Winter Feed - 92sqm', 1, 30.00, 30.00),
  ('10e11200-0801-4008-a008-000800080001', '10e02024-1200-4001-a001-000000000008', '12090901-0003-4003-a003-120909010003', 'Autumn/Winter Feed - 155sqm', 1, 37.20, 37.20),
  ('10e11200-0901-4009-a009-000900090001', '10e02024-1200-4001-a001-000000000009', '12160601-0001-4001-a001-121606010001', 'Autumn/Winter Feed - 88sqm', 1, 30.00, 30.00),
  ('10e11200-1001-4010-a010-001000100001', '10e02024-1200-4001-a001-000000000010', '12160601-0002-4002-a002-121606010002', 'Autumn/Winter Feed - 115sqm', 1, 30.00, 30.00),
  ('10e11200-1101-4011-a011-001100110001', '10e02024-1200-4001-a001-000000000011', '12160601-0003-4003-a003-121606010003', 'Autumn/Winter Feed - 195sqm', 1, 46.80, 46.80);

-- ============================================================================
-- PAYMENTS
-- Payments received for paid invoices
-- ============================================================================
INSERT INTO payments (id, invoice_id, customer_id, payment_reference, payment_method, amount, payment_date, is_confirmed, notes) VALUES
  ('0a002024-1200-4001-a001-000000000001', '10e02024-1200-4001-a001-000000000001', 'c0501111-1111-4111-a111-111111111111', 'DD-2025-12-15-001', 'direct_debit', 41.76, '2025-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000002', '10e02024-1200-4001-a001-000000000002', 'c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'DD-2025-12-15-002', 'direct_debit', 51.26, '2025-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000003', '10e02024-1200-4001-a001-000000000003', 'c0500007-0007-4007-a007-000700070007', 'BACS-2025-12-18-001', 'bank_transfer', 82.08, '2025-12-18', true, 'Bank transfer'),
  ('0a002024-1200-4001-a001-000000000004', '10e02024-1200-4001-a001-000000000004', 'c0506666-6666-4666-a666-666666666666', 'DD-2025-12-15-003', 'direct_debit', 72.00, '2025-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000005', '10e02024-1200-4001-a001-000000000006', 'c0503333-3333-4333-a333-333333333333', 'DD-2025-12-20-001', 'direct_debit', 47.52, '2025-12-20', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000006', '10e02024-1200-4001-a001-000000000008', 'c050cccc-cccc-4ccc-cccc-cccccccccccc', 'CARD-2025-12-14-001', 'card', 44.64, '2025-12-14', true, 'Card payment online'),
  ('0a002024-1200-4001-a001-000000000007', '10e02024-1200-4001-a001-000000000011', 'c0500009-0009-4009-a009-000900090009', 'DD-2025-12-20-002', 'direct_debit', 56.16, '2025-12-20', true, 'Monthly direct debit');

-- ============================================================================
-- STOCK MOVEMENTS (Initial stock + job consumptions)
-- ============================================================================
INSERT INTO stock_movements (correlation_id, product_id, warehouse_id, movement_type, quantity, reference_type, notes) VALUES
  -- Initial stock receipts
  (extensions.uuid_generate_v4(), 'aaaa1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 48, 'initial_stock', 'Initial spring fertiliser stock'),
  (extensions.uuid_generate_v4(), 'aaaa2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 'receive', 36, 'initial_stock', 'Initial summer fertiliser stock'),
  (extensions.uuid_generate_v4(), 'aaaa3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 'receive', 24, 'initial_stock', 'Initial autumn fertiliser stock'),
  (extensions.uuid_generate_v4(), 'bbbb1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 30, 'initial_stock', 'Initial iron sulphate stock'),
  (extensions.uuid_generate_v4(), 'bbbb2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 'receive', 12, 'initial_stock', 'Initial herbicide stock'),
  (extensions.uuid_generate_v4(), 'cccc1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 15, 'initial_stock', 'Initial leatherjacket nematodes'),
  (extensions.uuid_generate_v4(), 'cccc2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', 'receive', 12, 'initial_stock', 'Initial chafer nematodes'),
  (extensions.uuid_generate_v4(), 'dddd1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 20, 'initial_stock', 'Initial lawn seed stock'),
  (extensions.uuid_generate_v4(), 'dddd3333-3333-4333-a333-333333333333', '11111111-1111-4111-a111-111111111111', 'receive', 60, 'initial_stock', 'Initial top dressing stock'),
  (extensions.uuid_generate_v4(), 'eeee1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'receive', 15, 'initial_stock', 'Initial soil conditioner stock'),
  (extensions.uuid_generate_v4(), 'aaaa1111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222', 'receive', 24, 'initial_stock', 'Warwick depot - spring fert'),
  (extensions.uuid_generate_v4(), 'aaaa2222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222', 'receive', 18, 'initial_stock', 'Warwick depot - summer fert'),
  (extensions.uuid_generate_v4(), 'aaaa3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', 'receive', 12, 'initial_stock', 'Warwick depot - autumn fert'),
  (extensions.uuid_generate_v4(), 'aaaa1111-1111-4111-a111-111111111111', '33333333-3333-4333-a333-333333333333', 'receive', 12, 'initial_stock', 'Stafford depot - spring fert'),
  (extensions.uuid_generate_v4(), 'aaaa2222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 'receive', 8, 'initial_stock', 'Stafford depot - summer fert');

-- Drop helper function
DROP FUNCTION IF EXISTS calc_treatment_price;

-- ============================================================================
-- SUMMARY
-- ============================================================================
DO $$
DECLARE
  customer_count INTEGER;
  property_count INTEGER;
  lawn_count INTEGER;
  treatment_count INTEGER;
  plan_count INTEGER;
  job_count INTEGER;
  invoice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO property_count FROM properties;
  SELECT COUNT(*) INTO lawn_count FROM lawns;
  SELECT COUNT(*) INTO treatment_count FROM treatments;
  SELECT COUNT(*) INTO plan_count FROM treatment_plans;
  SELECT COUNT(*) INTO job_count FROM jobs;
  SELECT COUNT(*) INTO invoice_count FROM invoices;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Lawn Care Seed Data Loaded Successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Based on Green Man Lawn Care pricing model';
  RAISE NOTICE 'West Midlands service area focus';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Depots:           3';
  RAISE NOTICE 'Products:         15 (fertilisers, treatments, seeds)';
  RAISE NOTICE 'Treatments:       13 (core + premium + problem)';
  RAISE NOTICE 'Operators:        6';
  RAISE NOTICE 'Vehicles:         5';
  RAISE NOTICE 'Customers:        %', customer_count;
  RAISE NOTICE 'Properties:       %', property_count;
  RAISE NOTICE 'Lawns:            % (40-380 sqm range)', lawn_count;
  RAISE NOTICE 'Treatment Plans:  % (2024 & 2025)', plan_count;
  RAISE NOTICE 'Jobs:             % (completed & scheduled)', job_count;
  RAISE NOTICE 'Invoices:         %', invoice_count;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Pricing: £26-30 min, ~£0.20-0.24/sqm';
  RAISE NOTICE 'Programmes: Basic, Standard, Ultimate';
  RAISE NOTICE '========================================';
END $$;
