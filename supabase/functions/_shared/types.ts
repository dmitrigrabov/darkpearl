import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'

// Re-export Database type for convenience
export type { Database }

// Supabase client type alias
export type Client = SupabaseClient<Database>

// Enum types derived from generated types
export type MovementType = Database['public']['Enums']['movement_type']
export type OrderStatus = Database['public']['Enums']['order_status']
export type SagaStatus = Database['public']['Enums']['saga_status']
export type SagaStepType = Database['public']['Enums']['saga_step_type']

// Lawn care domain enum types (from database)
export type LawnCondition = Database['public']['Enums']['lawn_condition']
export type RouteStatus = Database['public']['Enums']['route_status']
export type JobStatus = Database['public']['Enums']['job_status']
export type InvoiceStatus = Database['public']['Enums']['invoice_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']

// Lawn care domain enum types (from database)
export type TreatmentSeason = Database['public']['Enums']['treatment_season']
export type TreatmentPlanStatus = Database['public']['Enums']['treatment_plan_status']

// Lawn care domain string types (not db enums, stored as strings)
export type PreferredContactMethod = 'email' | 'phone' | 'sms'

// Database row types derived from generated types
export type Product = Database['public']['Tables']['products']['Row']
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type Inventory = Database['public']['Tables']['inventory']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Saga = Database['public']['Tables']['sagas']['Row']
export type SagaEvent = Database['public']['Tables']['saga_events']['Row']

// Lawn care domain row types
export type Customer = Database['public']['Tables']['customers']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Lawn = Database['public']['Tables']['lawns']['Row']
export type Treatment = Database['public']['Tables']['treatments']['Row']
export type TreatmentProduct = Database['public']['Tables']['treatment_products']['Row']
export type TreatmentPlan = Database['public']['Tables']['treatment_plans']['Row']
export type TreatmentPlanItem = Database['public']['Tables']['treatment_plan_items']['Row']
export type Operator = Database['public']['Tables']['operators']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Route = Database['public']['Tables']['routes']['Row']
export type RouteStop = Database['public']['Tables']['route_stops']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobTreatment = Database['public']['Tables']['job_treatments']['Row']
export type JobConsumption = Database['public']['Tables']['job_consumptions']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

// Insert types for creating records
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert']
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert']
export type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

// Lawn care domain insert types
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type LawnInsert = Database['public']['Tables']['lawns']['Insert']
export type TreatmentInsert = Database['public']['Tables']['treatments']['Insert']
export type TreatmentProductInsert = Database['public']['Tables']['treatment_products']['Insert']
export type TreatmentPlanInsert = Database['public']['Tables']['treatment_plans']['Insert']
export type TreatmentPlanItemInsert = Database['public']['Tables']['treatment_plan_items']['Insert']
export type OperatorInsert = Database['public']['Tables']['operators']['Insert']
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
export type RouteInsert = Database['public']['Tables']['routes']['Insert']
export type RouteStopInsert = Database['public']['Tables']['route_stops']['Insert']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobTreatmentInsert = Database['public']['Tables']['job_treatments']['Insert']
export type JobConsumptionInsert = Database['public']['Tables']['job_consumptions']['Insert']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']

// Update types for modifying records
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update']
export type InventoryUpdate = Database['public']['Tables']['inventory']['Update']

// Lawn care domain update types
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']
export type LawnUpdate = Database['public']['Tables']['lawns']['Update']
export type TreatmentUpdate = Database['public']['Tables']['treatments']['Update']
export type TreatmentPlanUpdate = Database['public']['Tables']['treatment_plans']['Update']
export type TreatmentPlanItemUpdate = Database['public']['Tables']['treatment_plan_items']['Update']
export type OperatorUpdate = Database['public']['Tables']['operators']['Update']
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']
export type RouteUpdate = Database['public']['Tables']['routes']['Update']
export type RouteStopUpdate = Database['public']['Tables']['route_stops']['Update']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Request/Response types for API endpoints
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
  minutes_per_100sqm?: number
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
  scheduled_week?: number
  price_snapshot?: number
}

export type UpdateTreatmentPlanItemRequest = {
  window_start?: string
  window_end?: string
  scheduled_week?: number
  is_completed?: boolean
  price_snapshot?: number
}

// Operator requests
export type CreateOperatorRequest = {
  employee_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  depot_id?: string
  user_id?: string
  hourly_cost?: number
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
  depot_id?: string
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
  lawn_area_sqm?: number
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

// Hono environment types
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
