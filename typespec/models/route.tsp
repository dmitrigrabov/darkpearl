namespace DarkPearl.Models;

@doc("Daily route for an operator")
model Route {
  @doc("Unique route identifier")
  id: string;

  @doc("Assigned operator")
  operator_id: string;

  @doc("Assigned vehicle")
  vehicle_id?: string;

  @doc("Starting depot")
  depot_id: string;

  @doc("Route date")
  route_date: plainDate;

  @doc("Route status")
  status: RouteStatus;

  @doc("Estimated distance in miles")
  estimated_distance_miles?: float64;

  @doc("Actual distance in miles")
  actual_distance_miles?: float64;

  @doc("Estimated duration in minutes")
  estimated_duration_minutes?: int32;

  @doc("Actual duration in minutes")
  actual_duration_minutes?: int32;

  @doc("When route started")
  started_at?: utcDateTime;

  @doc("When route completed")
  completed_at?: utcDateTime;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Stop within a route")
model RouteStop {
  @doc("Unique stop identifier")
  id: string;

  @doc("Parent route")
  route_id: string;

  @doc("Lawn to visit")
  lawn_id: string;

  @doc("Job for this stop")
  job_id?: string;

  @doc("Order in route (1, 2, 3...)")
  stop_order: int32;

  @doc("Estimated arrival time")
  estimated_arrival?: utcDateTime;

  @doc("Estimated departure time")
  estimated_departure?: utcDateTime;

  @doc("Actual arrival time")
  actual_arrival?: utcDateTime;

  @doc("Actual departure time")
  actual_departure?: utcDateTime;

  @doc("Distance from previous stop in miles")
  distance_from_previous_miles?: float64;

  @doc("Creation timestamp")
  created_at: utcDateTime;

  @doc("Last update timestamp")
  updated_at: utcDateTime;
}

@doc("Route stop with lawn and customer details")
model RouteStopWithDetails {
  ...RouteStop;

  @doc("Lawn details")
  lawn?: {
    id: string;
    address_line1: string;
    postcode: string;
    area_sqm: float64;
    latitude?: float64;
    longitude?: float64;
    access_notes?: string;
  };

  @doc("Customer details")
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

@doc("Route with full details")
model RouteWithDetails {
  ...Route;

  @doc("Route stops")
  stops?: RouteStopWithDetails[];

  @doc("Operator details")
  operator?: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    phone: string;
  };

  @doc("Vehicle details")
  vehicle?: {
    id: string;
    registration: string;
    make?: string;
    vehicle_model?: string;
  };

  @doc("Depot details")
  depot?: {
    id: string;
    code: string;
    name: string;
  };
}

@doc("Request to create a route")
model CreateRouteRequest {
  @doc("Assigned operator")
  operator_id: string;

  @doc("Assigned vehicle")
  vehicle_id?: string;

  @doc("Starting depot")
  depot_id: string;

  @doc("Route date")
  route_date: plainDate;

  @doc("Route status (defaults to draft)")
  status?: RouteStatus;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to update a route")
model UpdateRouteRequest {
  @doc("Assigned operator")
  operator_id?: string;

  @doc("Assigned vehicle")
  vehicle_id?: string;

  @doc("Route date")
  route_date?: plainDate;

  @doc("Route status")
  status?: RouteStatus;

  @doc("Estimated distance in miles")
  estimated_distance_miles?: float64;

  @doc("Actual distance in miles")
  actual_distance_miles?: float64;

  @doc("Estimated duration in minutes")
  estimated_duration_minutes?: int32;

  @doc("Actual duration in minutes")
  actual_duration_minutes?: int32;

  @doc("When route started")
  started_at?: utcDateTime;

  @doc("When route completed")
  completed_at?: utcDateTime;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to add stop to route")
model CreateRouteStopRequest {
  @doc("Lawn to visit")
  lawn_id: string;

  @doc("Order in route")
  stop_order: int32;

  @doc("Estimated arrival time")
  estimated_arrival?: utcDateTime;

  @doc("Estimated departure time")
  estimated_departure?: utcDateTime;

  @doc("Distance from previous stop in miles")
  distance_from_previous_miles?: float64;
}

@doc("Request to update a route stop")
model UpdateRouteStopRequest {
  @doc("Order in route")
  stop_order?: int32;

  @doc("Estimated arrival time")
  estimated_arrival?: utcDateTime;

  @doc("Estimated departure time")
  estimated_departure?: utcDateTime;

  @doc("Actual arrival time")
  actual_arrival?: utcDateTime;

  @doc("Actual departure time")
  actual_departure?: utcDateTime;

  @doc("Distance from previous stop in miles")
  distance_from_previous_miles?: float64;
}

@doc("Paginated list of routes")
model RouteListResponse {
  @doc("List of routes")
  data: RouteWithDetails[];

  ...PaginationMeta;
}
