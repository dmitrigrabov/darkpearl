namespace DarkPearl.Models;

@doc("Actual work performed at a lawn")
model Job {
  @doc("Unique job identifier")
  id: string;

  @doc("Lawn where work is performed")
  lawn_id: string;

  @doc("Route stop (if scheduled via route)")
  route_stop_id?: string;

  @doc("Treatment plan item being fulfilled")
  treatment_plan_item_id?: string;

  @doc("Job number (e.g., JOB-20240315-001)")
  job_number: string;

  @doc("Job status")
  status: JobStatus;

  @doc("Scheduled date")
  scheduled_date: plainDate;

  @doc("When work started")
  started_at?: utcDateTime;

  @doc("When work completed")
  completed_at?: utcDateTime;

  @doc("Operator who performed the work")
  performed_by?: string;

  @doc("Lawn area at time of job")
  lawn_area_sqm: float64;

  @doc("Lawn condition at time of job")
  lawn_condition_at_job?: LawnCondition;

  @doc("Notes before work")
  before_notes?: string;

  @doc("Notes after work")
  after_notes?: string;

  @doc("Customer signature URL")
  customer_signature_url?: string;

  @doc("Before photos (array of URLs)")
  before_photos?: string[];

  @doc("After photos (array of URLs)")
  after_photos?: string[];

  ...Timestamps;
}

@doc("Treatment performed within a job")
model JobTreatment {
  @doc("Unique identifier")
  id: string;

  @doc("Parent job")
  job_id: string;

  @doc("Treatment type")
  treatment_id: string;

  @doc("Price charged")
  price_charged: float64;

  @doc("Duration in minutes")
  duration_minutes?: int32;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Product consumed during a job")
model JobConsumption {
  @doc("Unique identifier")
  id: string;

  @doc("Parent job")
  job_id: string;

  @doc("Job treatment this relates to")
  job_treatment_id: string;

  @doc("Product consumed")
  product_id: string;

  @doc("Depot stock was taken from")
  warehouse_id: string;

  @doc("Quantity consumed")
  quantity_consumed: float64;

  @doc("Stock movement reference")
  stock_movement_id?: string;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Job treatment with details")
model JobTreatmentWithDetails {
  ...JobTreatment;

  @doc("Treatment details")
  treatment?: {
    id: string;
    code: string;
    name: string;
  };

  @doc("Consumptions for this treatment")
  consumptions?: JobConsumption[];
}

@doc("Job with full details")
model JobWithDetails {
  ...Job;

  @doc("Treatments performed")
  treatments?: JobTreatmentWithDetails[];

  @doc("Lawn details")
  lawn?: {
    id: string;
    address_line1: string;
    postcode: string;
  };

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
  };

  @doc("Operator details")
  operator?: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
  };
}

@doc("Request to create a job")
model CreateJobRequest {
  @doc("Lawn where work is performed")
  lawn_id: string;

  @doc("Route stop (if scheduled via route)")
  route_stop_id?: string;

  @doc("Treatment plan item being fulfilled")
  treatment_plan_item_id?: string;

  @doc("Job status (defaults to scheduled)")
  status?: JobStatus;

  @doc("Scheduled date")
  scheduled_date: plainDate;

  @doc("Lawn area at time of job")
  lawn_area_sqm: float64;

  @doc("Lawn condition at time of job")
  lawn_condition_at_job?: LawnCondition;

  @doc("Access notes for operators")
  before_notes?: string;
}

@doc("Request to update a job")
model UpdateJobRequest {
  @doc("Job status")
  status?: JobStatus;

  @doc("When work started")
  started_at?: utcDateTime;

  @doc("When work completed")
  completed_at?: utcDateTime;

  @doc("Operator who performed the work")
  performed_by?: string;

  @doc("Lawn condition at time of job")
  lawn_condition_at_job?: LawnCondition;

  @doc("Notes before work")
  before_notes?: string;

  @doc("Notes after work")
  after_notes?: string;

  @doc("Customer signature URL")
  customer_signature_url?: string;

  @doc("Before photos (array of URLs)")
  before_photos?: string[];

  @doc("After photos (array of URLs)")
  after_photos?: string[];
}

@doc("Request to add treatment to job")
model CreateJobTreatmentRequest {
  @doc("Treatment type")
  treatment_id: string;

  @doc("Price charged")
  price_charged: float64;

  @doc("Duration in minutes")
  duration_minutes?: int32;
}

@doc("Request to record product consumption")
model CreateJobConsumptionRequest {
  @doc("Job treatment this relates to")
  job_treatment_id: string;

  @doc("Product consumed")
  product_id: string;

  @doc("Depot stock was taken from")
  warehouse_id: string;

  @doc("Quantity consumed")
  quantity_consumed: float64;
}

@doc("Paginated list of jobs")
model JobListResponse {
  @doc("List of jobs")
  data: JobWithDetails[];

  ...PaginationMeta;
}
