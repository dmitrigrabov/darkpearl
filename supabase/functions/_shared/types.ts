import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'

// Supabase client type alias
export type Client = SupabaseClient<Database>

// ============================================
// ENUM TYPES
// ============================================

// Core domain enums
export type MovementType = 'receive' | 'transfer_out' | 'transfer_in' | 'adjust' | 'reserve' | 'release' | 'fulfill' | 'consume'
export type OrderStatus = 'pending' | 'reserved' | 'payment_processing' | 'payment_failed' | 'paid' | 'fulfilling' | 'fulfilled' | 'cancelled'
export type SagaStatus = 'started' | 'step_pending' | 'step_executing' | 'step_completed' | 'step_failed' | 'compensating' | 'compensation_completed' | 'completed' | 'failed'
export type SagaStepType = 'reserve_stock' | 'process_payment' | 'fulfill_order' | 'release_stock' | 'void_payment'

// Lawn care domain enums
export type LawnCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'new'
export type RouteStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentMethod = 'card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque'
export type TreatmentSeason = 'spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late'
export type TreatmentPlanStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type PreferredContactMethod = 'email' | 'phone' | 'sms'

// ============================================
// ROW TYPES (Database entity types)
// ============================================

// Core domain types
export type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  unit_price: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Warehouse = {
  id: string
  code: string
  name: string
  address: string | null
  is_active: boolean
  is_depot: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Inventory = {
  id: string
  product_id: string
  warehouse_id: string
  quantity_available: number
  quantity_reserved: number
  reorder_point: number
  reorder_quantity: number
  created_at: string
  updated_at: string
}

export type StockMovement = {
  id: string
  correlation_id: string | null
  product_id: string
  warehouse_id: string
  movement_type: MovementType
  quantity: number
  reference_id: string | null
  reference_type: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export type Order = {
  id: string
  order_number: string
  customer_id: string | null
  warehouse_id: string
  status: OrderStatus
  total_amount: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export type Saga = {
  id: string
  saga_type: string
  correlation_id: string
  payload: Record<string, unknown>
  status: SagaStatus
  current_step: string | null
  steps_completed: string[]
  error_message: string | null
  retry_count: number
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type SagaEvent = {
  id: string
  saga_id: string
  step_type: SagaStepType
  event_type: string
  payload: Record<string, unknown> | null
  error_message: string | null
  created_at: string
}

// Lawn care domain types
export type Customer = {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  phone_secondary: string | null
  preferred_contact_method: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_postcode: string | null
  marketing_consent: boolean
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Property = {
  id: string
  customer_id: string
  address_line1: string
  address_line2: string | null
  city: string
  postcode: string
  latitude: number | null
  longitude: number | null
  access_notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Lawn = {
  id: string
  property_id: string
  name: string
  area_sqm: number
  lawn_condition: LawnCondition | null
  boundary: unknown | null
  access_notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Treatment = {
  id: string
  code: string
  name: string
  description: string | null
  price_per_sqm: number
  min_price: number | null
  minutes_per_100sqm: number
  setup_minutes: number | null
  season: TreatmentSeason | null
  sequence_in_year: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TreatmentProduct = {
  id: string
  treatment_id: string
  product_id: string
  quantity_per_100sqm: number
  quantity_multiplier_poor: number | null
  created_at: string
}

export type TreatmentPlan = {
  id: string
  lawn_id: string
  year: number
  status: TreatmentPlanStatus
  total_estimated_price: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TreatmentPlanItem = {
  id: string
  treatment_plan_id: string
  treatment_id: string
  window_start: string | null
  window_end: string | null
  scheduled_week: number | null
  is_completed: boolean
  price_snapshot: number | null
  created_at: string
}

export type Operator = {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  depot_id: string | null
  user_id: string | null
  hourly_cost: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Vehicle = {
  id: string
  registration: string
  depot_id: string | null
  make: string | null
  vehicle_model: string | null
  cost_per_mile: number | null
  load_capacity_kg: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Route = {
  id: string
  operator_id: string
  depot_id: string
  vehicle_id: string | null
  route_date: string
  status: RouteStatus
  estimated_duration_minutes: number | null
  estimated_distance_miles: number | null
  actual_duration_minutes: number | null
  actual_distance_miles: number | null
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type RouteStop = {
  id: string
  route_id: string
  lawn_id: string
  stop_order: number
  estimated_arrival: string | null
  estimated_departure: string | null
  actual_arrival: string | null
  actual_departure: string | null
  distance_from_previous_miles: number | null
  created_at: string
}

export type Job = {
  id: string
  job_number: string
  lawn_id: string
  performed_by: string | null
  route_stop_id: string | null
  treatment_plan_item_id: string | null
  scheduled_date: string
  lawn_area_sqm: number
  status: JobStatus
  lawn_condition_at_job: LawnCondition | null
  before_notes: string | null
  before_photos: unknown | null
  after_notes: string | null
  after_photos: unknown | null
  customer_signature_url: string | null
  started_at: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type JobTreatment = {
  id: string
  job_id: string
  treatment_id: string
  price_charged: number
  duration_minutes: number | null
  created_at: string
}

export type JobConsumption = {
  id: string
  job_treatment_id: string
  product_id: string
  warehouse_id: string
  quantity_consumed: number
  stock_movement_id: string | null
  created_at: string
}

export type Invoice = {
  id: string
  customer_id: string
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  subtotal: number
  vat_rate: number | null
  vat_amount: number
  total_amount: number
  amount_paid: number
  payment_terms_days: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  job_id: string | null
  description: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

export type Payment = {
  id: string
  invoice_id: string
  customer_id: string
  payment_reference: string | null
  payment_method: PaymentMethod
  amount: number
  payment_date: string
  is_confirmed: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================
// REQUEST/RESPONSE TYPES FOR API ENDPOINTS
// ============================================

// Product requests
export type CreateProductRequest = {
  sku: string
  name: string
  description?: string
  unit_price?: number
  is_active?: boolean
}

export type UpdateProductRequest = {
  sku?: string
  name?: string
  description?: string
  unit_price?: number
  is_active?: boolean
}

// Warehouse requests
export type CreateWarehouseRequest = {
  code: string
  name: string
  address?: string
  is_active?: boolean
}

export type UpdateWarehouseRequest = {
  code?: string
  name?: string
  address?: string
  is_active?: boolean
}

// Inventory requests
export type CreateInventoryRequest = {
  product_id: string
  warehouse_id: string
  quantity_available?: number
  reorder_point?: number
  reorder_quantity?: number
}

export type UpdateInventoryRequest = {
  quantity_available?: number
  quantity_reserved?: number
  reorder_point?: number
  reorder_quantity?: number
}

// Stock movement requests
export type CreateStockMovementRequest = {
  correlation_id?: string
  product_id: string
  warehouse_id: string
  movement_type: MovementType
  quantity: number
  reference_id?: string
  reference_type?: string
  notes?: string
}

// Order requests
export type CreateOrderRequest = {
  customer_id?: string
  warehouse_id: string
  notes?: string
  items: CreateOrderItemRequest[]
}

export type CreateOrderItemRequest = {
  product_id: string
  quantity: number
  unit_price: number
}

// Saga payload for order fulfillment
export type OrderFulfillmentPayload = {
  order_id: string
  warehouse_id: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  payment_reference?: string
}

// ============================================
// LAWN CARE DOMAIN REQUEST/RESPONSE TYPES
// ============================================

// Customer requests
export type CreateCustomerRequest = {
  customer_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  phone_secondary?: string
  preferred_contact_method?: PreferredContactMethod
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_postcode?: string
  marketing_consent?: boolean
  notes?: string
  is_active?: boolean
}

export type UpdateCustomerRequest = {
  customer_number?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  phone_secondary?: string
  preferred_contact_method?: PreferredContactMethod
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_postcode?: string
  marketing_consent?: boolean
  notes?: string
  is_active?: boolean
}

// Property requests
export type CreatePropertyRequest = {
  customer_id: string
  address_line1: string
  address_line2?: string
  city: string
  postcode: string
  latitude?: number
  longitude?: number
  access_notes?: string
  is_active?: boolean
}

export type UpdatePropertyRequest = {
  address_line1?: string
  address_line2?: string
  city?: string
  postcode?: string
  latitude?: number
  longitude?: number
  access_notes?: string
  is_active?: boolean
}

// Lawn requests
export type CreateLawnRequest = {
  property_id: string
  name: string
  area_sqm: number
  lawn_condition?: LawnCondition
  boundary?: Array<{ latitude: number; longitude: number }>
  access_notes?: string
  is_active?: boolean
}

export type UpdateLawnRequest = {
  name?: string
  area_sqm?: number
  lawn_condition?: LawnCondition
  boundary?: Array<{ latitude: number; longitude: number }>
  access_notes?: string
  is_active?: boolean
}

// Treatment requests
export type CreateTreatmentRequest = {
  code: string
  name: string
  description?: string
  price_per_sqm: number
  min_price?: number
  minutes_per_100sqm: number
  setup_minutes?: number
  season?: TreatmentSeason
  sequence_in_year?: number
  is_active?: boolean
}

export type UpdateTreatmentRequest = {
  code?: string
  name?: string
  description?: string
  price_per_sqm?: number
  min_price?: number
  minutes_per_100sqm?: number
  setup_minutes?: number
  season?: TreatmentSeason
  sequence_in_year?: number
  is_active?: boolean
}

export type AddTreatmentProductRequest = {
  product_id: string
  quantity_per_100sqm: number
  quantity_multiplier_poor?: number
}

// Treatment plan requests
export type CreateTreatmentPlanRequest = {
  lawn_id: string
  year: number
  status?: TreatmentPlanStatus
  total_estimated_price?: number
  notes?: string
}

export type UpdateTreatmentPlanRequest = {
  status?: TreatmentPlanStatus
  total_estimated_price?: number
  notes?: string
}

export type AddTreatmentPlanItemRequest = {
  treatment_id: string
  window_start?: string
  window_end?: string
  scheduled_week?: string
  price_snapshot: number
}

export type UpdateTreatmentPlanItemRequest = {
  window_start?: string
  window_end?: string
  scheduled_week?: string
  is_completed?: boolean
  price_snapshot?: number
}

// Operator requests
export type CreateOperatorRequest = {
  employee_number: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  depot_id: string
  user_id?: string
  hourly_cost: number
  is_active?: boolean
}

export type UpdateOperatorRequest = {
  employee_number?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  depot_id?: string
  user_id?: string
  hourly_cost?: number
  is_active?: boolean
}

// Vehicle requests
export type CreateVehicleRequest = {
  registration: string
  depot_id: string
  make?: string
  vehicle_model?: string
  cost_per_mile?: number
  load_capacity_kg?: number
  is_active?: boolean
}

export type UpdateVehicleRequest = {
  registration?: string
  depot_id?: string
  make?: string
  vehicle_model?: string
  cost_per_mile?: number
  load_capacity_kg?: number
  is_active?: boolean
}

// Route requests
export type CreateRouteRequest = {
  operator_id: string
  depot_id: string
  vehicle_id?: string
  route_date: string
  status?: RouteStatus
  estimated_duration_minutes?: number
  estimated_distance_miles?: number
  notes?: string
}

export type UpdateRouteRequest = {
  operator_id?: string
  vehicle_id?: string
  route_date?: string
  status?: RouteStatus
  estimated_duration_minutes?: number
  estimated_distance_miles?: number
  actual_duration_minutes?: number
  actual_distance_miles?: number
  notes?: string
}

export type AddRouteStopRequest = {
  lawn_id: string
  stop_order: number
  estimated_arrival?: string
  estimated_departure?: string
  distance_from_previous_miles?: number
}

export type UpdateRouteStopRequest = {
  stop_order?: number
  estimated_arrival?: string
  estimated_departure?: string
  actual_arrival?: string
  actual_departure?: string
  distance_from_previous_miles?: number
}

// Job requests
export type CreateJobRequest = {
  lawn_id: string
  performed_by?: string
  route_stop_id?: string
  treatment_plan_item_id?: string
  scheduled_date: string
  lawn_area_sqm: number
  status?: JobStatus
  lawn_condition_at_job?: LawnCondition
  before_notes?: string
  after_notes?: string
}

export type UpdateJobRequest = {
  performed_by?: string
  route_stop_id?: string
  treatment_plan_item_id?: string
  scheduled_date?: string
  lawn_area_sqm?: number
  status?: JobStatus
  lawn_condition_at_job?: LawnCondition
  before_notes?: string
  after_notes?: string
  before_photos?: string[]
  after_photos?: string[]
  customer_signature_url?: string
}

export type AddJobTreatmentRequest = {
  treatment_id: string
  price_charged: number
  duration_minutes?: number
}

export type AddJobConsumptionRequest = {
  job_treatment_id: string
  product_id: string
  warehouse_id: string
  quantity_consumed: number
}

// Invoice requests
export type CreateInvoiceRequest = {
  customer_id: string
  issue_date?: string
  due_date?: string
  payment_terms_days?: number
  vat_rate?: number
  status?: InvoiceStatus
  notes?: string
}

export type UpdateInvoiceRequest = {
  issue_date?: string
  due_date?: string
  payment_terms_days?: number
  vat_rate?: number
  status?: InvoiceStatus
  notes?: string
}

export type AddInvoiceItemRequest = {
  job_id?: string
  description: string
  quantity: number
  unit_price: number
}

export type UpdateInvoiceItemRequest = {
  description?: string
  quantity?: number
  unit_price?: number
}

// Payment requests
export type CreatePaymentRequest = {
  customer_id: string
  invoice_id: string
  amount: number
  payment_date?: string
  payment_method: PaymentMethod
  payment_reference?: string
  notes?: string
}

export type UpdatePaymentRequest = {
  amount?: number
  payment_date?: string
  payment_method?: PaymentMethod
  payment_reference?: string
  notes?: string
  is_confirmed?: boolean
}

// ============================================
// HONO ENVIRONMENT TYPES
// ============================================

export type SupabaseEnv = {
  Variables: {
    supabase: Client
  }
}

export type SupabaseWithServiceEnv = {
  Variables: {
    supabase: Client
    serviceClient: Client
  }
}
