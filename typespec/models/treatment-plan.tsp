namespace DarkPearl.Models;

@doc("Annual treatment plan for a lawn")
model TreatmentPlan {
  @doc("Unique plan identifier")
  id: string;

  @doc("Lawn this plan is for")
  lawn_id: string;

  @doc("Plan year")
  year: int32;

  @doc("Plan status")
  status: TreatmentPlanStatus;

  @doc("Total estimated price")
  total_estimated_price?: float64;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Individual treatment within a plan")
model TreatmentPlanItem {
  @doc("Unique item identifier")
  id: string;

  @doc("Parent treatment plan")
  treatment_plan_id: string;

  @doc("Treatment type")
  treatment_id: string;

  @doc("Target week for treatment")
  scheduled_week?: plainDate;

  @doc("Earliest acceptable date")
  window_start?: plainDate;

  @doc("Latest acceptable date")
  window_end?: plainDate;

  @doc("Price at time of planning")
  price_snapshot: float64;

  @doc("Whether treatment has been completed")
  is_completed: boolean;

  @doc("Job that completed this item")
  completed_job_id?: string;

  @doc("Creation timestamp")
  created_at: utcDateTime;

  @doc("Last update timestamp")
  updated_at: utcDateTime;
}

@doc("Treatment plan item with treatment details")
model TreatmentPlanItemWithDetails {
  ...TreatmentPlanItem;

  @doc("Treatment details")
  treatment?: {
    id: string;
    code: string;
    name: string;
  };
}

@doc("Treatment plan with all items and lawn details")
model TreatmentPlanWithDetails {
  ...TreatmentPlan;

  @doc("Plan items")
  items?: TreatmentPlanItemWithDetails[];

  @doc("Lawn details")
  lawn?: {
    id: string;
    address_line1: string;
    postcode: string;
    area_sqm: float64;
  };

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
  };
}

@doc("Request to create a treatment plan")
model CreateTreatmentPlanRequest {
  @doc("Lawn this plan is for")
  lawn_id: string;

  @doc("Plan year")
  year: int32;

  @doc("Plan status (defaults to active)")
  status?: TreatmentPlanStatus;

  @doc("Total estimated price")
  total_estimated_price?: float64;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to update a treatment plan")
model UpdateTreatmentPlanRequest {
  @doc("Plan status")
  status?: TreatmentPlanStatus;

  @doc("Total estimated price")
  total_estimated_price?: float64;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to add item to treatment plan")
model CreateTreatmentPlanItemRequest {
  @doc("Treatment type")
  treatment_id: string;

  @doc("Target week for treatment")
  scheduled_week?: plainDate;

  @doc("Earliest acceptable date")
  window_start?: plainDate;

  @doc("Latest acceptable date")
  window_end?: plainDate;

  @doc("Price at time of planning")
  price_snapshot: float64;
}

@doc("Request to update a treatment plan item")
model UpdateTreatmentPlanItemRequest {
  @doc("Target week for treatment")
  scheduled_week?: plainDate;

  @doc("Earliest acceptable date")
  window_start?: plainDate;

  @doc("Latest acceptable date")
  window_end?: plainDate;

  @doc("Price snapshot")
  price_snapshot?: float64;
}

@doc("Paginated list of treatment plans")
model TreatmentPlanListResponse {
  @doc("List of treatment plans")
  data: TreatmentPlanWithDetails[];

  ...PaginationMeta;
}
