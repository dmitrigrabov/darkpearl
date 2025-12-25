-- Stock movement types
CREATE TYPE movement_type AS ENUM (
  'receive',      -- Incoming stock (purchase, return)
  'transfer_out', -- Outgoing transfer to another warehouse
  'transfer_in',  -- Incoming transfer from another warehouse
  'adjust',       -- Manual adjustment (count correction)
  'reserve',      -- Reserve for order
  'release',      -- Release reservation
  'fulfill'       -- Fulfill order (reduce stock)
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending',
  'reserved',
  'payment_processing',
  'payment_failed',
  'paid',
  'fulfilling',
  'fulfilled',
  'cancelled'
);

-- Saga status
CREATE TYPE saga_status AS ENUM (
  'started',
  'step_pending',
  'step_executing',
  'step_completed',
  'step_failed',
  'compensating',
  'compensation_completed',
  'completed',
  'failed'
);

-- Saga step types for order fulfillment
CREATE TYPE saga_step_type AS ENUM (
  'reserve_stock',
  'process_payment',
  'fulfill_order',
  'release_stock',        -- Compensation
  'void_payment'          -- Compensation
);
