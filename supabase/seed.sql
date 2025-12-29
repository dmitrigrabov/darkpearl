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
  ('c0500010-0010-4010-a010-001000100010', 'GM-10025', 'Martin', 'Spencer', 'mspencer@outlook.com', '01926 112345', '07912 345678', '34 Warwick Road', NULL, 'Kenilworth', 'CV8 1HE', true, 'email', true, 'Moss problem in north-facing garden.');

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
  ('00100008-0008-4008-a008-000800080008', 'c0500008-0008-4008-a008-000800080008', '6 Church Walk', NULL, 'Atherstone', 'CV9 1DH', 52.5789, -1.5567, 'Large lawn with mature trees. Partial shade.', true);

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
  ('1a000008-0008-4008-a008-000800080008', '00100008-0008-4008-a008-000800080008', 'Main Lawn', 275.00, 'good', 'Partial shade from mature oaks', true);

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
  ('e0101111-2025-4001-a001-000000000001', '01a01111-2025-4111-a111-111111111111', '00011111-1111-4111-a111-111111111111', '2025-03-10', '2025-02-24', '2025-03-31', 31.90, false),
  ('e0101111-2025-4001-a001-000000000002', '01a01111-2025-4111-a111-111111111111', '00022222-2222-4222-a222-222222222222', '2025-05-12', '2025-04-28', '2025-05-31', 29.00, false),
  ('e0101111-2025-4001-a001-000000000003', '01a01111-2025-4111-a111-111111111111', '00033333-3333-4333-a333-333333333333', '2025-07-07', '2025-06-23', '2025-07-31', 31.90, false),
  ('e0101111-2025-4001-a001-000000000004', '01a01111-2025-4111-a111-111111111111', '00044444-4444-4444-a444-444444444444', '2025-09-01', '2025-08-18', '2025-09-30', 29.00, false),
  ('e0101111-2025-4001-a001-000000000005', '01a01111-2025-4111-a111-111111111111', '00055555-5555-4555-a555-555555555555', '2025-11-10', '2025-10-27', '2025-12-15', 34.80, false),
  -- Standard additions
  ('e0101111-2025-4001-a001-000000000006', '01a01111-2025-4111-a111-111111111111', '00066666-6666-4666-a666-666666666666', '2025-09-15', '2025-09-01', '2025-10-15', 65.25, false),
  ('e0101111-2025-4001-a001-000000000007', '01a01111-2025-4111-a111-111111111111', '00077777-7777-4777-a777-777777777777', '2025-04-07', '2025-03-24', '2025-04-30', 55.10, false);

-- Basic programme items for 01a0bbbb-2025 (88sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  ('e010bbbb-2025-4001-a001-000000000001', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00011111-1111-4111-a111-111111111111', '2025-03-17', '2025-03-03', '2025-04-07', 28.00, false),
  ('e010bbbb-2025-4001-a001-000000000002', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00022222-2222-4222-a222-222222222222', '2025-05-19', '2025-05-05', '2025-06-07', 26.00, false),
  ('e010bbbb-2025-4001-a001-000000000003', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00033333-3333-4333-a333-333333333333', '2025-07-14', '2025-06-30', '2025-08-07', 28.00, false),
  ('e010bbbb-2025-4001-a001-000000000004', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00044444-4444-4444-a444-444444444444', '2025-09-08', '2025-08-25', '2025-10-07', 26.00, false),
  ('e010bbbb-2025-4001-a001-000000000005', '01a0bbbb-2025-4bbb-bbbb-bbbbbbbbbbbb', '00055555-5555-4555-a555-555555555555', '2025-11-17', '2025-11-03', '2025-12-15', 30.00, false);

-- Ultimate programme items for 01a05555-2025 (380sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  -- Core treatments
  ('e0105555-2025-4001-a001-000000000001', '01a05555-2025-4555-a555-555555555555', '00011111-1111-4111-a111-111111111111', '2025-03-03', '2025-02-17', '2025-03-24', 83.60, false),
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
  ('e0100010-2025-4001-a001-000000000001', '01a00010-2025-4010-a010-001000100010', '000ddddd-dddd-4ddd-dddd-dddddddddddd', '2025-02-24', '2025-02-10', '2025-03-17', 38.00, false),
  ('e0100010-2025-4001-a001-000000000002', '01a00010-2025-4010-a010-001000100010', '00011111-1111-4111-a111-111111111111', '2025-03-17', '2025-03-03', '2025-04-07', 28.00, false),
  ('e0100010-2025-4001-a001-000000000003', '01a00010-2025-4010-a010-001000100010', '00022222-2222-4222-a222-222222222222', '2025-05-19', '2025-05-05', '2025-06-07', 26.00, false),
  ('e0100010-2025-4001-a001-000000000004', '01a00010-2025-4010-a010-001000100010', '00033333-3333-4333-a333-333333333333', '2025-07-14', '2025-06-30', '2025-08-07', 28.00, false),
  ('e0100010-2025-4001-a001-000000000005', '01a00010-2025-4010-a010-001000100010', '00044444-4444-4444-a444-444444444444', '2025-09-08', '2025-08-25', '2025-10-07', 26.00, false),
  ('e0100010-2025-4001-a001-000000000006', '01a00010-2025-4010-a010-001000100010', '00055555-5555-4555-a555-555555555555', '2025-11-17', '2025-11-03', '2025-12-15', 30.00, false),
  ('e0100010-2025-4001-a001-000000000007', '01a00010-2025-4010-a010-001000100010', '00066666-6666-4666-a666-666666666666', '2025-09-22', '2025-09-08', '2025-10-20', 56.25, false),
  ('e0100010-2025-4001-a001-000000000008', '01a00010-2025-4010-a010-001000100010', '00077777-7777-4777-a777-777777777777', '2025-04-07', '2025-03-24', '2025-04-28', 55.00, false);

-- Leatherjacket treatment plan for 01a00007-2025 (285sqm lawn)
INSERT INTO treatment_plan_items (id, treatment_plan_id, treatment_id, scheduled_week, window_start, window_end, price_snapshot, is_completed) VALUES
  ('e0100007-2025-4001-a001-000000000001', '01a00007-2025-4007-a007-000700070007', '00011111-1111-4111-a111-111111111111', '2025-03-10', '2025-02-24', '2025-03-31', 62.70, false),
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
  ('12021202-0001-4001-a001-120212020001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2024-12-02', 'completed', 45.5, 47.2, 360, 385, '2024-12-02 08:30:00+00', '2024-12-02 15:05:00+00', 'Autumn feed round - Sutton area'),
  ('12031203-0001-4001-a001-120312030001', '0e002222-2222-4222-a222-222222222222', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2024-12-03', 'completed', 38.2, 39.8, 320, 335, '2024-12-03 08:45:00+00', '2024-12-03 14:25:00+00', 'Erdington/Sutton mixed'),
  ('12091209-0001-4001-a001-120912090001', '0e003333-3333-4333-a333-333333333333', '0e0a3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', '2024-12-09', 'completed', 52.3, 54.1, 390, 410, '2024-12-09 08:15:00+00', '2024-12-09 15:30:00+00', 'Leamington/Warwick round'),
  ('12161216-0001-4001-a001-121612160001', '0e005555-5555-4555-a555-555555555555', '0e0a5555-5555-4555-a555-555555555555', '33333333-3333-4333-a333-333333333333', '2024-12-16', 'completed', 42.8, 44.5, 340, 358, '2024-12-16 08:30:00+00', '2024-12-16 14:55:00+00', 'Stafford area winter feed'),

  -- Routes for early January 2025 (scheduled/upcoming)
  ('01060106-0001-4001-a001-010601060001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2025-01-06', 'confirmed', 48.0, NULL, 375, NULL, NULL, NULL, 'Winter feed - Sutton Coldfield'),
  ('01070107-0001-4001-a001-010701070001', '0e003333-3333-4333-a333-333333333333', '0e0a3333-3333-4333-a333-333333333333', '22222222-2222-4222-a222-222222222222', '2025-01-07', 'confirmed', 55.0, NULL, 410, NULL, NULL, NULL, 'Winter feed - Leamington/Warwick'),
  ('01080108-0001-4001-a001-010801080001', '0e005555-5555-4555-a555-555555555555', '0e0a5555-5555-4555-a555-555555555555', '33333333-3333-4333-a333-333333333333', '2025-01-08', 'confirmed', 44.0, NULL, 350, NULL, NULL, NULL, 'Winter feed - Stafford'),
  ('01130113-0001-4001-a001-011301130001', '0e002222-2222-4222-a222-222222222222', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2025-01-13', 'draft', 41.0, NULL, 340, NULL, NULL, NULL, 'Lichfield area'),

  -- Upcoming spring routes (draft)
  ('02240224-0001-4001-a001-022402240001', '0e001111-1111-4111-a111-111111111111', '0e0a1111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2025-02-24', 'draft', 50.0, NULL, 400, NULL, NULL, NULL, 'Early spring - moss treatment round'),
  ('03030303-0001-4001-a001-030303030001', '0e006666-6666-4666-a666-666666666666', '0e0a2222-2222-4222-a222-222222222222', '11111111-1111-4111-a111-111111111111', '2025-03-03', 'draft', 46.0, NULL, 380, NULL, NULL, NULL, 'Spring feed round 1');

-- ============================================================================
-- JOBS (Actual work performed)
-- Mix of completed jobs from 2024 and scheduled for 2025
-- ============================================================================
INSERT INTO jobs (id, job_number, lawn_id, route_stop_id, treatment_plan_item_id, status, scheduled_date, started_at, completed_at, performed_by, lawn_area_sqm, lawn_condition_at_job, before_notes, after_notes) VALUES
  -- Completed December 2024 jobs
  ('12020201-0001-4001-a001-120202010001', 'JOB-20241202-001', '1a001111-1111-4111-a111-111111111111', NULL, NULL, 'completed', '2024-12-02', '2024-12-02 09:15:00+00', '2024-12-02 09:45:00+00', '0e001111-1111-4111-a111-111111111111', 145.00, 'good', 'Lawn in good condition despite autumn weather', 'Applied autumn/winter feed. Customer pleased with lawn condition.'),
  ('12020201-0002-4002-a002-120202010002', 'JOB-20241202-002', '1a00aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'completed', '2024-12-02', '2024-12-02 10:30:00+00', '2024-12-02 11:05:00+00', '0e001111-1111-4111-a111-111111111111', 178.00, 'good', 'Dog was inside as requested', 'Autumn feed applied. Slight moss starting in corner - mentioned to customer.'),
  ('12020201-0003-4003-a003-120202010003', 'JOB-20241202-003', '1a000007-0007-4007-a007-000700070007', NULL, NULL, 'completed', '2024-12-02', '2024-12-02 11:45:00+00', '2024-12-02 12:35:00+00', '0e001111-1111-4111-a111-111111111111', 285.00, 'good', 'Large lawn. No signs of leatherjacket activity currently.', 'Winter feed applied. Lawn looking healthy going into winter.'),
  ('12030301-0001-4001-a001-120303010001', 'JOB-20241203-001', '1a006666-6666-4666-a666-666666666666', NULL, NULL, 'completed', '2024-12-03', '2024-12-03 09:00:00+00', '2024-12-03 09:20:00+00', '0e002222-2222-4222-a222-222222222222', 38.00, 'fair', 'Small front lawn', 'Applied winter feed. Discussed upgrading to standard programme for 2025.'),
  ('12030301-0002-4002-a002-120303010002', 'JOB-20241203-002', '1a006666-6666-4666-a666-666666666667', NULL, NULL, 'completed', '2024-12-03', '2024-12-03 09:25:00+00', '2024-12-03 09:50:00+00', '0e002222-2222-4222-a222-222222222222', 95.00, 'good', 'Back lawn in better condition than front', 'Winter feed applied successfully.'),
  ('12030301-0003-4003-a003-120303010003', 'JOB-20241203-003', '1a00dddd-dddd-4ddd-dddd-dddddddddddd', NULL, NULL, 'completed', '2024-12-03', '2024-12-03 10:30:00+00', '2024-12-03 11:00:00+00', '0e002222-2222-4222-a222-222222222222', 110.00, 'new', 'New lawn from 2023 - establishing well', 'Applied light winter feed. Lawn looking good for age.'),
  ('12090901-0001-4001-a001-120909010001', 'JOB-20241209-001', '1a003333-3333-4333-a333-333333333333', NULL, NULL, 'completed', '2024-12-09', '2024-12-09 08:45:00+00', '2024-12-09 09:30:00+00', '0e003333-3333-4333-a333-333333333333', 165.00, 'good', 'Key under plant pot - access successful', 'Autumn/winter feed. Lawn in excellent condition.'),
  ('12090901-0002-4002-a002-120909010002', 'JOB-20241209-002', '1a004444-4444-4444-a444-444444444444', NULL, NULL, 'completed', '2024-12-09', '2024-12-09 10:15:00+00', '2024-12-09 10:50:00+00', '0e003333-3333-4333-a333-333333333333', 92.00, 'fair', 'Knocked loudly - customer answered', 'Winter feed with extra moss control. Will need heavy treatment in spring.'),
  ('12090901-0003-4003-a003-120909010003', 'JOB-20241209-003', '1a00cccc-cccc-4ccc-cccc-cccccccccccc', NULL, NULL, 'completed', '2024-12-09', '2024-12-09 11:30:00+00', '2024-12-09 12:15:00+00', '0e003333-3333-4333-a333-333333333333', 155.00, 'excellent', 'Customer was in garden - discussed lawn care', 'Winter feed. Customer maintains beautiful lawn edges.'),
  ('12160601-0001-4001-a001-121606010001', 'JOB-20241216-001', '1a00bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'completed', '2024-12-16', '2024-12-16 09:00:00+00', '2024-12-16 09:30:00+00', '0e005555-5555-4555-a555-555555555555', 88.00, 'good', 'Access straightforward', 'Winter feed applied.'),
  ('12160601-0002-4002-a002-121606010002', 'JOB-20241216-002', '1a000003-0003-4003-a003-000300030003', NULL, NULL, 'completed', '2024-12-16', '2024-12-16 10:15:00+00', '2024-12-16 10:50:00+00', '0e005555-5555-4555-a555-555555555555', 115.00, 'fair', 'Saturday appointment as requested', 'Winter feed. Bare patches noted - recommend overseeding in autumn 2025.'),
  ('12160601-0003-4003-a003-121606010003', 'JOB-20241216-003', '1a000009-0009-4009-a009-000900090009', NULL, NULL, 'completed', '2024-12-16', '2024-12-16 11:30:00+00', '2024-12-16 12:15:00+00', '0e005555-5555-4555-a555-555555555555', 195.00, 'good', 'Large lawn - allowed extra time', 'Winter feed applied. Lawn in good health.'),

  -- Scheduled jobs for January 2025
  ('01060601-0001-4001-a001-010606010001', 'JOB-20250106-001', '1a002222-2222-4222-a222-222222222222', NULL, NULL, 'scheduled', '2025-01-06', NULL, NULL, NULL, 85.50, NULL, NULL, NULL),
  ('01060601-0002-4002-a002-010606010002', 'JOB-20250106-002', '1a000001-0001-4001-a001-000100010001', NULL, NULL, 'scheduled', '2025-01-06', NULL, NULL, NULL, 42.00, NULL, NULL, NULL),
  ('01060601-0003-4003-a003-010606010003', 'JOB-20250106-003', '1a000001-0001-4001-a001-000100010002', NULL, NULL, 'scheduled', '2025-01-06', NULL, NULL, NULL, 125.00, NULL, NULL, NULL),
  ('01070701-0001-4001-a001-010707010001', 'JOB-20250107-001', '1a009999-9999-4999-a999-999999999999', NULL, NULL, 'scheduled', '2025-01-07', NULL, NULL, NULL, 175.00, NULL, NULL, NULL),
  ('01070701-0002-4002-a002-010707010002', 'JOB-20250107-002', '1a000002-0002-4002-a002-000200020002', NULL, NULL, 'scheduled', '2025-01-07', NULL, NULL, NULL, 210.00, NULL, NULL, NULL),
  ('01070701-0003-4003-a003-010707010003', 'JOB-20250107-003', '1a000005-0005-4005-a005-000500050005', NULL, NULL, 'scheduled', '2025-01-07', NULL, NULL, NULL, 135.00, NULL, NULL, NULL),
  ('01080801-0001-4001-a001-010808010001', 'JOB-20250108-001', '1a000008-0008-4008-a008-000800080008', NULL, NULL, 'scheduled', '2025-01-08', NULL, NULL, NULL, 275.00, NULL, NULL, NULL);

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
  ('10e02024-1200-4001-a001-000000000001', 'INV-2024-00145', 'c0501111-1111-4111-a111-111111111111', 'paid', '2024-12-05', '2025-01-04', 34.80, 20.00, 6.96, 41.76, 41.76, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000002', 'INV-2024-00146', 'c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'paid', '2024-12-05', '2025-01-04', 42.72, 20.00, 8.54, 51.26, 51.26, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000003', 'INV-2024-00147', 'c0500007-0007-4007-a007-000700070007', 'paid', '2024-12-05', '2025-01-04', 68.40, 20.00, 13.68, 82.08, 82.08, 30, 'December treatment - leatherjacket property'),
  ('10e02024-1200-4001-a001-000000000004', 'INV-2024-00148', 'c0506666-6666-4666-a666-666666666666', 'paid', '2024-12-06', '2025-01-05', 60.00, 20.00, 12.00, 72.00, 72.00, 30, 'December treatment - both lawns'),
  ('10e02024-1200-4001-a001-000000000005', 'INV-2024-00149', 'c050dddd-dddd-4ddd-dddd-dddddddddddd', 'sent', '2024-12-06', '2025-01-05', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000006', 'INV-2024-00150', 'c0503333-3333-4333-a333-333333333333', 'paid', '2024-12-12', '2025-01-11', 39.60, 20.00, 7.92, 47.52, 47.52, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000007', 'INV-2024-00151', 'c0504444-4444-4444-a444-444444444444', 'sent', '2024-12-12', '2025-01-11', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000008', 'INV-2024-00152', 'c050cccc-cccc-4ccc-cccc-cccccccccccc', 'paid', '2024-12-12', '2025-01-11', 37.20, 20.00, 7.44, 44.64, 44.64, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000009', 'INV-2024-00153', 'c050bbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'sent', '2024-12-18', '2025-01-17', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000010', 'INV-2024-00154', 'c0500003-0003-4003-a003-000300030003', 'sent', '2024-12-18', '2025-01-17', 30.00, 20.00, 6.00, 36.00, 0.00, 30, 'December treatment'),
  ('10e02024-1200-4001-a001-000000000011', 'INV-2024-00155', 'c0500009-0009-4009-a009-000900090009', 'paid', '2024-12-18', '2025-01-17', 46.80, 20.00, 9.36, 56.16, 56.16, 30, 'December treatment');

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
  ('0a002024-1200-4001-a001-000000000001', '10e02024-1200-4001-a001-000000000001', 'c0501111-1111-4111-a111-111111111111', 'DD-2024-12-15-001', 'direct_debit', 41.76, '2024-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000002', '10e02024-1200-4001-a001-000000000002', 'c050aaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'DD-2024-12-15-002', 'direct_debit', 51.26, '2024-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000003', '10e02024-1200-4001-a001-000000000003', 'c0500007-0007-4007-a007-000700070007', 'BACS-2024-12-18-001', 'bank_transfer', 82.08, '2024-12-18', true, 'Bank transfer'),
  ('0a002024-1200-4001-a001-000000000004', '10e02024-1200-4001-a001-000000000004', 'c0506666-6666-4666-a666-666666666666', 'DD-2024-12-15-003', 'direct_debit', 72.00, '2024-12-15', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000005', '10e02024-1200-4001-a001-000000000006', 'c0503333-3333-4333-a333-333333333333', 'DD-2024-12-20-001', 'direct_debit', 47.52, '2024-12-20', true, 'Monthly direct debit'),
  ('0a002024-1200-4001-a001-000000000006', '10e02024-1200-4001-a001-000000000008', 'c050cccc-cccc-4ccc-cccc-cccccccccccc', 'CARD-2024-12-14-001', 'card', 44.64, '2024-12-14', true, 'Card payment online'),
  ('0a002024-1200-4001-a001-000000000007', '10e02024-1200-4001-a001-000000000011', 'c0500009-0009-4009-a009-000900090009', 'DD-2024-12-20-002', 'direct_debit', 56.16, '2024-12-20', true, 'Monthly direct debit');

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
