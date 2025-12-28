namespace DarkPearl.Models;

@doc("Company vehicle")
model Vehicle {
  @doc("Unique vehicle identifier")
  id: string;

  @doc("Home depot (warehouse)")
  depot_id: string;

  @doc("Vehicle registration (UK format)")
  registration: string;

  @doc("Vehicle make")
  make?: string;

  @doc("Vehicle model")
  vehicle_model?: string;

  @doc("Cost per mile")
  cost_per_mile?: float64;

  @doc("Load capacity in kg")
  load_capacity_kg?: float64;

  @doc("Whether vehicle is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Vehicle with depot details")
model VehicleWithDetails {
  ...Vehicle;

  @doc("Depot details")
  depot?: {
    id: string;
    code: string;
    name: string;
  };
}

@doc("Request to create a new vehicle")
model CreateVehicleRequest {
  @doc("Home depot (warehouse)")
  depot_id: string;

  @doc("Vehicle registration (UK format)")
  registration: string;

  @doc("Vehicle make")
  make?: string;

  @doc("Vehicle model")
  vehicle_model?: string;

  @doc("Cost per mile")
  cost_per_mile?: float64;

  @doc("Load capacity in kg")
  load_capacity_kg?: float64;

  @doc("Whether vehicle is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing vehicle")
model UpdateVehicleRequest {
  @doc("Home depot")
  depot_id?: string;

  @doc("Vehicle registration")
  registration?: string;

  @doc("Vehicle make")
  make?: string;

  @doc("Vehicle model")
  vehicle_model?: string;

  @doc("Cost per mile")
  cost_per_mile?: float64;

  @doc("Load capacity in kg")
  load_capacity_kg?: float64;

  @doc("Whether vehicle is active")
  is_active?: boolean;
}

@doc("Paginated list of vehicles")
model VehicleListResponse {
  @doc("List of vehicles")
  data: VehicleWithDetails[];

  ...PaginationMeta;
}
