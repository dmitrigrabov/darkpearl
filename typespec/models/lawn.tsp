namespace DarkPearl.Models;

@doc("Property/lawn belonging to a customer")
model Lawn {
  @doc("Unique lawn identifier")
  id: string;

  @doc("Customer who owns this lawn")
  customer_id: string;

  @doc("Address line 1")
  address_line1: string;

  @doc("Address line 2")
  address_line2?: string;

  @doc("City")
  city: string;

  @doc("UK postcode")
  postcode: string;

  @doc("Latitude for routing")
  latitude?: float64;

  @doc("Longitude for routing")
  longitude?: float64;

  @doc("Lawn area in square meters")
  area_sqm: float64;

  @doc("Current lawn condition")
  lawn_condition: LawnCondition;

  @doc("Access notes for operators")
  access_notes?: string;

  @doc("Whether lawn is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Lawn with customer details")
model LawnWithDetails {
  ...Lawn;

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
  @doc("Customer who owns this lawn")
  customer_id: string;

  @doc("Address line 1")
  address_line1: string;

  @doc("Address line 2")
  address_line2?: string;

  @doc("City")
  city: string;

  @doc("UK postcode")
  postcode: string;

  @doc("Latitude for routing")
  latitude?: float64;

  @doc("Longitude for routing")
  longitude?: float64;

  @doc("Lawn area in square meters")
  area_sqm: float64;

  @doc("Current lawn condition (defaults to new)")
  lawn_condition?: LawnCondition;

  @doc("Access notes for operators")
  access_notes?: string;

  @doc("Whether lawn is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing lawn")
model UpdateLawnRequest {
  @doc("Address line 1")
  address_line1?: string;

  @doc("Address line 2")
  address_line2?: string;

  @doc("City")
  city?: string;

  @doc("UK postcode")
  postcode?: string;

  @doc("Latitude for routing")
  latitude?: float64;

  @doc("Longitude for routing")
  longitude?: float64;

  @doc("Lawn area in square meters")
  area_sqm?: float64;

  @doc("Current lawn condition")
  lawn_condition?: LawnCondition;

  @doc("Access notes for operators")
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
