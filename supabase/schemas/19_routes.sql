-- Daily routes for operators

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Assignment
  operator_id UUID NOT NULL REFERENCES operators(id),
  vehicle_id UUID REFERENCES vehicles(id),
  depot_id UUID NOT NULL REFERENCES warehouses(id),

  -- Schedule
  route_date DATE NOT NULL,

  -- Status
  status route_status NOT NULL DEFAULT 'draft',

  -- Metrics
  estimated_distance_miles DECIMAL(8, 2),
  actual_distance_miles DECIMAL(8, 2),
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_routes_operator ON routes(operator_id);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_routes_depot ON routes(depot_id);
CREATE INDEX idx_routes_date ON routes(route_date);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_operator_date ON routes(operator_id, route_date);
CREATE INDEX idx_routes_created_by ON routes(created_by);

CREATE TRIGGER routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Stops within a route
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  lawn_id UUID NOT NULL REFERENCES lawns(id),
  job_id UUID,

  -- Sequence
  stop_order INTEGER NOT NULL,

  -- Timing estimates
  estimated_arrival TIMESTAMPTZ,
  estimated_departure TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,

  -- Distance from previous stop
  distance_from_previous_miles DECIMAL(6, 2),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(route_id, stop_order)
);

-- Indexes
CREATE INDEX idx_route_stops_route ON route_stops(route_id);
CREATE INDEX idx_route_stops_lawn ON route_stops(lawn_id);
CREATE INDEX idx_route_stops_job ON route_stops(job_id);
CREATE INDEX idx_route_stops_order ON route_stops(route_id, stop_order);

CREATE TRIGGER route_stops_updated_at
  BEFORE UPDATE ON route_stops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
