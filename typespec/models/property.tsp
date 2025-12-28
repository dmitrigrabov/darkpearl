namespace DarkPearl.Models;

@doc("Property belonging to a customer (physical location)")
model Property {
  @doc("Unique property identifier")
  id: string;

  @doc("Customer who owns this property")
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

  @doc("Access notes for operators")
  access_notes?: string;

  @doc("Whether property is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Property with customer details")
model PropertyWithDetails {
  ...Property;

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
  };
}

@doc("Request to create a new property")
model CreatePropertyRequest {
  @doc("Customer who owns this property")
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

  @doc("Access notes for operators")
  access_notes?: string;

  @doc("Whether property is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing property")
model UpdatePropertyRequest {
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

  @doc("Access notes for operators")
  access_notes?: string;

  @doc("Whether property is active")
  is_active?: boolean;
}

@doc("Paginated list of properties")
model PropertyListResponse {
  @doc("List of properties")
  data: PropertyWithDetails[];

  ...PaginationMeta;
}
