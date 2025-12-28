namespace DarkPearl.Models;

@doc("Treatment type catalog")
model Treatment {
  @doc("Unique treatment identifier")
  id: string;

  @doc("Treatment code (e.g., FERT-01)")
  code: string;

  @doc("Treatment name")
  name: string;

  @doc("Treatment description")
  description?: string;

  @doc("Typical season for application")
  season?: TreatmentSeason;

  @doc("Sequence in annual treatment program (1-5)")
  sequence_in_year?: int32;

  @doc("Base price per square meter")
  price_per_sqm: float64;

  @doc("Minimum charge for treatment")
  min_price: float64;

  @doc("Minutes to treat 100 sqm")
  minutes_per_100sqm: float64;

  @doc("Setup time per lawn in minutes")
  setup_minutes: int32;

  @doc("Whether treatment is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Product consumption for a treatment")
model TreatmentProduct {
  @doc("Unique identifier")
  id: string;

  @doc("Treatment this applies to")
  treatment_id: string;

  @doc("Product consumed")
  product_id: string;

  @doc("Quantity per 100 sqm")
  quantity_per_100sqm: float64;

  @doc("Multiplier for poor condition lawns")
  quantity_multiplier_poor: float64;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Treatment with product details")
model TreatmentWithProducts {
  ...Treatment;

  @doc("Products consumed by this treatment")
  products?: TreatmentProduct[];
}

@doc("Request to create a new treatment")
model CreateTreatmentRequest {
  @doc("Treatment code - must be unique")
  code: string;

  @doc("Treatment name")
  name: string;

  @doc("Treatment description")
  description?: string;

  @doc("Typical season for application")
  season?: TreatmentSeason;

  @doc("Sequence in annual treatment program (1-5)")
  sequence_in_year?: int32;

  @doc("Base price per square meter")
  price_per_sqm: float64;

  @doc("Minimum charge for treatment (defaults to 0)")
  min_price?: float64;

  @doc("Minutes to treat 100 sqm")
  minutes_per_100sqm: float64;

  @doc("Setup time per lawn in minutes (defaults to 5)")
  setup_minutes?: int32;

  @doc("Whether treatment is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing treatment")
model UpdateTreatmentRequest {
  @doc("Treatment code")
  code?: string;

  @doc("Treatment name")
  name?: string;

  @doc("Treatment description")
  description?: string;

  @doc("Typical season for application")
  season?: TreatmentSeason;

  @doc("Sequence in annual treatment program (1-5)")
  sequence_in_year?: int32;

  @doc("Base price per square meter")
  price_per_sqm?: float64;

  @doc("Minimum charge for treatment")
  min_price?: float64;

  @doc("Minutes to treat 100 sqm")
  minutes_per_100sqm?: float64;

  @doc("Setup time per lawn in minutes")
  setup_minutes?: int32;

  @doc("Whether treatment is active")
  is_active?: boolean;
}

@doc("Request to link product to treatment")
model CreateTreatmentProductRequest {
  @doc("Product to link")
  product_id: string;

  @doc("Quantity per 100 sqm")
  quantity_per_100sqm: float64;

  @doc("Multiplier for poor condition lawns (defaults to 1.2)")
  quantity_multiplier_poor?: float64;
}

@doc("Paginated list of treatments")
model TreatmentListResponse {
  @doc("List of treatments")
  data: Treatment[];

  ...PaginationMeta;
}
