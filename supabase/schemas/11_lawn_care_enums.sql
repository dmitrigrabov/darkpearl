-- Lawn care domain enums

-- Treatment season/timing
CREATE TYPE treatment_season AS ENUM (
  'spring_early',     -- Feb-March
  'spring_late',      -- April-May
  'summer',           -- June-July
  'autumn_early',     -- Aug-Sept
  'autumn_late'       -- Oct-Nov
);

-- Job status
CREATE TYPE job_status AS ENUM (
  'scheduled',        -- In a route, pending execution
  'in_progress',      -- Operator is on-site working
  'completed',        -- Work finished
  'cancelled',        -- Cancelled before completion
  'skipped',          -- Skipped (customer not home, gate locked, etc.)
  'rescheduled'       -- Moved to different date
);

-- Treatment plan status
CREATE TYPE treatment_plan_status AS ENUM (
  'active',           -- Currently being scheduled
  'paused',           -- Temporarily paused (customer request)
  'completed',        -- All treatments done for the year
  'cancelled'         -- Cancelled by customer
);

-- Route status
CREATE TYPE route_status AS ENUM (
  'draft',            -- Being planned
  'confirmed',        -- Finalized, ready for execution
  'in_progress',      -- Operator is currently executing
  'completed',        -- All stops done
  'cancelled'         -- Route cancelled
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
  'draft',            -- Being prepared
  'sent',             -- Sent to customer
  'paid',             -- Payment received
  'partial',          -- Partially paid
  'overdue',          -- Past due date
  'cancelled',        -- Voided
  'refunded'          -- Money returned
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
  'card',             -- Credit/debit card
  'bank_transfer',    -- BACS, direct bank transfer
  'direct_debit',     -- UK Direct Debit
  'cash',             -- Cash payment
  'cheque'            -- Cheque
);

-- Lawn condition
CREATE TYPE lawn_condition AS ENUM (
  'excellent',        -- Top shape
  'good',             -- Minor issues
  'fair',             -- Needs attention
  'poor',             -- Significant problems
  'new'               -- New lawn/customer
);

-- Add 'consume' to movement_type for job consumption tracking
ALTER TYPE movement_type ADD VALUE IF NOT EXISTS 'consume' AFTER 'fulfill';
