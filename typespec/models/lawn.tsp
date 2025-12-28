namespace DarkPearl.Models;

@doc("Coordinate point for polygon boundary")
model Coordinate {
  @doc("Latitude")
  latitude: float64;

  @doc("Longitude")
  longitude: float64;
}

@doc("Lawn area within a property")
model Lawn {
  @doc("Unique lawn identifier")
  id: string;

  @doc("Property this lawn belongs to")
  property_id: string;

  @doc("Lawn name (e.g., 'Front Garden', 'Back Garden')")
  name: string;

  @doc("Lawn area in square meters")
  area_sqm: float64;

  @doc("Current lawn condition")
  lawn_condition: LawnCondition;

  @doc("Polygon boundary coordinates")
  boundary?: Coordinate[];

  @doc("Access notes for this specific lawn")
  access_notes?: string;

  @doc("Whether lawn is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Lawn with property and customer details")
model LawnWithDetails {
  ...Lawn;

  @doc("Property details")
  property?: {
    id: string;
    address_line1: string;
    postcode: string;
    latitude?: float64;
    longitude?: float64;
  };

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
  };
}

@doc("Request to create a new lawn")
model CreateLawnRequest {
  @doc("Property this lawn belongs to")
  property_id: string;

  @doc("Lawn name (e.g., 'Front Garden', 'Back Garden')")
  name: string;

  @doc("Lawn area in square meters")
  area_sqm: float64;

  @doc("Current lawn condition (defaults to new)")
  lawn_condition?: LawnCondition;

  @doc("Polygon boundary coordinates")
  boundary?: Coordinate[];

  @doc("Access notes for this specific lawn")
  access_notes?: string;

  @doc("Whether lawn is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing lawn")
model UpdateLawnRequest {
  @doc("Lawn name")
  name?: string;

  @doc("Lawn area in square meters")
  area_sqm?: float64;

  @doc("Current lawn condition")
  lawn_condition?: LawnCondition;

  @doc("Polygon boundary coordinates")
  boundary?: Coordinate[];

  @doc("Access notes for this specific lawn")
  access_notes?: string;

  @doc("Whether lawn is active")
  is_active?: boolean;
}

@doc("Paginated list of lawns")
model LawnListResponse {
  @doc("List of lawns")
  data: LawnWithDetails[];

  ...PaginationMeta;
}
