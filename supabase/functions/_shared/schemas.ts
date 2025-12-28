import * as z from 'zod'

// Enum schemas matching database enums
export const movementTypeSchema = z.enum([
  'receive',
  'transfer_out',
  'transfer_in',
  'adjust',
  'reserve',
  'release',
  'fulfill'
])

export const orderStatusSchema = z.enum([
  'pending',
  'reserved',
  'payment_processing',
  'payment_failed',
  'paid',
  'fulfilling',
  'fulfilled',
  'cancelled'
])

export const sagaStatusSchema = z.enum([
  'started',
  'step_pending',
  'step_executing',
  'step_completed',
  'step_failed',
  'compensating',
  'compensation_completed',
  'completed',
  'failed'
])

export const sagaStepTypeSchema = z.enum([
  'reserve_stock',
  'process_payment',
  'fulfill_order',
  'release_stock',
  'void_payment'
])

// Lawn care domain enums
export const preferredContactMethodSchema = z.enum(['email', 'phone', 'sms'])

export const lawnConditionSchema = z.enum(['excellent', 'good', 'fair', 'poor', 'new'])

export const treatmentSeasonSchema = z.enum([
  'spring_early',
  'spring_late',
  'summer',
  'autumn_early',
  'autumn_late'
])

export const treatmentPlanStatusSchema = z.enum(['active', 'paused', 'completed', 'cancelled'])

export const routeStatusSchema = z.enum([
  'draft',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
])

export const jobStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'skipped',
  'rescheduled'
])

export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'partial',
  'overdue',
  'cancelled',
  'refunded'
])

export const paymentMethodSchema = z.enum([
  'card',
  'bank_transfer',
  'direct_debit',
  'cash',
  'cheque'
])

// Product schemas
export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unit_price: z.number().nonnegative('Unit price must be non-negative').optional(),
  is_active: z.boolean().optional()
})

export const updateProductSchema = z.object({
  sku: z.string().min(1, 'SKU cannot be empty').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().optional(),
  unit_price: z.number().nonnegative('Unit price must be non-negative').optional(),
  is_active: z.boolean().optional()
})

// Warehouse schemas
export const createWarehouseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  is_active: z.boolean().optional()
})

export const updateWarehouseSchema = z.object({
  code: z.string().min(1, 'Code cannot be empty').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional()
})

// Inventory schemas
export const createInventorySchema = z.object({
  product_id: z.uuid({ error: 'Product ID must be a valid UUID' }),
  warehouse_id: z.uuid({ error: 'Warehouse ID must be a valid UUID' }),
  quantity_available: z.number().int().nonnegative('Quantity must be non-negative').optional(),
  reorder_point: z.number().int().nonnegative('Reorder point must be non-negative').optional(),
  reorder_quantity: z.number().int().nonnegative('Reorder quantity must be non-negative').optional()
})

export const updateInventorySchema = z.object({
  quantity_available: z
    .number()
    .int()
    .nonnegative('Quantity available must be non-negative')
    .optional(),
  quantity_reserved: z
    .number()
    .int()
    .nonnegative('Quantity reserved must be non-negative')
    .optional(),
  reorder_point: z.number().int().nonnegative('Reorder point must be non-negative').optional(),
  reorder_quantity: z.number().int().nonnegative('Reorder quantity must be non-negative').optional()
})

// Stock movement schemas
export const createStockMovementSchema = z.object({
  correlation_id: z.uuid({ error: 'Correlation ID must be a valid UUID' }).optional(),
  product_id: z.uuid({ error: 'Product ID must be a valid UUID' }),
  warehouse_id: z.uuid({ error: 'Warehouse ID must be a valid UUID' }),
  movement_type: movementTypeSchema,
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  reference_id: z.string().optional(),
  reference_type: z.string().optional(),
  notes: z.string().optional()
})

// Order schemas
export const createOrderItemSchema = z.object({
  product_id: z.uuid({ error: 'Product ID must be a valid UUID' }),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit_price: z.number().nonnegative('Unit price must be non-negative').optional()
})

export const createOrderSchema = z.object({
  customer_id: z.string().optional(),
  warehouse_id: z.uuid({ error: 'Warehouse ID must be a valid UUID' }),
  notes: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, 'At least one item is required')
})

// Saga orchestrator schemas
export const sagaOrchestratorRequestSchema = z.object({
  saga_id: z.uuid({ error: 'Saga ID must be a valid UUID' }),
  action: z.enum(['execute_next', 'step_completed', 'step_failed', 'compensate']),
  step_result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional()
})

// Saga payload item schema (reusable)
export const sagaPayloadItemSchema = z.object({
  product_id: z.uuid({ error: 'Product ID must be a valid UUID' }),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit_price: z.number().nonnegative('Unit price must be non-negative')
})

// Saga payload stored in database
export const sagaPayloadSchema = z.object({
  order_id: z.uuid({ error: 'Order ID must be a valid UUID' }),
  warehouse_id: z.uuid({ error: 'Warehouse ID must be a valid UUID' }),
  items: z.array(sagaPayloadItemSchema)
})

// Event payload schemas
export const sagaStartPayloadSchema = z.object({
  saga_type: z.string().min(1, 'Saga type is required'),
  order_id: z.uuid({ error: 'Order ID must be a valid UUID' }),
  warehouse_id: z.uuid({ error: 'Warehouse ID must be a valid UUID' }),
  items: z.array(sagaPayloadItemSchema).min(1, 'At least one item is required')
})

export const sagaStepPayloadSchema = z.object({
  saga_id: z.uuid({ error: 'Saga ID must be a valid UUID' }),
  action: z.string().min(1, 'Action is required'),
  step_result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional()
})

// ============================================
// LAWN CARE DOMAIN SCHEMAS
// ============================================

// Customer schemas
export const createCustomerSchema = z.object({
  customer_number: z.string().min(1, 'Customer number is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  phone_secondary: z.string().optional(),
  preferred_contact_method: preferredContactMethodSchema.optional(),
  billing_address_line1: z.string().optional(),
  billing_address_line2: z.string().optional(),
  billing_city: z.string().optional(),
  billing_postcode: z.string().optional(),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional()
})

export const updateCustomerSchema = z.object({
  customer_number: z.string().min(1).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  phone_secondary: z.string().optional(),
  preferred_contact_method: preferredContactMethodSchema.optional(),
  billing_address_line1: z.string().optional(),
  billing_address_line2: z.string().optional(),
  billing_city: z.string().optional(),
  billing_postcode: z.string().optional(),
  marketing_consent: z.boolean().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional()
})

// Property schemas
export const createPropertySchema = z.object({
  customer_id: z.string().uuid('Customer ID must be a valid UUID'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  access_notes: z.string().optional(),
  is_active: z.boolean().optional()
})

export const updatePropertySchema = z.object({
  address_line1: z.string().min(1).optional(),
  address_line2: z.string().optional(),
  city: z.string().min(1).optional(),
  postcode: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  access_notes: z.string().optional(),
  is_active: z.boolean().optional()
})

// Lawn schemas
export const coordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
})

export const createLawnSchema = z.object({
  property_id: z.string().uuid('Property ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required'),
  area_sqm: z.number().positive('Area must be positive'),
  lawn_condition: lawnConditionSchema.optional(),
  boundary: z.array(coordinateSchema).optional(),
  access_notes: z.string().optional(),
  is_active: z.boolean().optional()
})

export const updateLawnSchema = z.object({
  name: z.string().min(1).optional(),
  area_sqm: z.number().positive('Area must be positive').optional(),
  lawn_condition: lawnConditionSchema.optional(),
  boundary: z.array(coordinateSchema).optional(),
  access_notes: z.string().optional(),
  is_active: z.boolean().optional()
})

// Treatment schemas
export const createTreatmentSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price_per_sqm: z.number().nonnegative('Price must be non-negative'),
  min_price: z.number().nonnegative('Min price must be non-negative').optional(),
  minutes_per_100sqm: z.number().int().positive().optional(),
  setup_minutes: z.number().int().nonnegative().optional(),
  season: treatmentSeasonSchema.optional(),
  sequence_in_year: z.number().int().positive().optional(),
  is_active: z.boolean().optional()
})

export const updateTreatmentSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price_per_sqm: z.number().nonnegative('Price must be non-negative').optional(),
  min_price: z.number().nonnegative('Min price must be non-negative').optional(),
  minutes_per_100sqm: z.number().int().positive().optional(),
  setup_minutes: z.number().int().nonnegative().optional(),
  season: treatmentSeasonSchema.optional(),
  sequence_in_year: z.number().int().positive().optional(),
  is_active: z.boolean().optional()
})

// Treatment product schemas (sub-resource)
export const addTreatmentProductSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  quantity_per_100sqm: z.number().positive('Quantity must be positive'),
  quantity_multiplier_poor: z.number().positive().optional()
})

// Treatment plan schemas
export const createTreatmentPlanSchema = z.object({
  lawn_id: z.string().uuid('Lawn ID must be a valid UUID'),
  year: z.number().int().min(2020).max(2100),
  status: treatmentPlanStatusSchema.optional(),
  total_estimated_price: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

export const updateTreatmentPlanSchema = z.object({
  status: treatmentPlanStatusSchema.optional(),
  total_estimated_price: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

// Treatment plan item schemas (sub-resource)
export const addTreatmentPlanItemSchema = z.object({
  treatment_id: z.string().uuid('Treatment ID must be a valid UUID'),
  window_start: z.string().datetime().optional(),
  window_end: z.string().datetime().optional(),
  scheduled_week: z.number().int().min(1).max(53).optional(),
  price_snapshot: z.number().nonnegative().optional()
})

export const updateTreatmentPlanItemSchema = z.object({
  window_start: z.string().datetime().optional(),
  window_end: z.string().datetime().optional(),
  scheduled_week: z.number().int().min(1).max(53).optional(),
  is_completed: z.boolean().optional(),
  price_snapshot: z.number().nonnegative().optional()
})

// Operator schemas
export const createOperatorSchema = z.object({
  employee_number: z.string().min(1, 'Employee number is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  depot_id: z.string().uuid('Depot ID must be a valid UUID').optional(),
  user_id: z.string().uuid('User ID must be a valid UUID').optional(),
  hourly_cost: z.number().nonnegative().optional(),
  is_active: z.boolean().optional()
})

export const updateOperatorSchema = z.object({
  employee_number: z.string().min(1).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  depot_id: z.string().uuid('Depot ID must be a valid UUID').optional(),
  user_id: z.string().uuid('User ID must be a valid UUID').optional(),
  hourly_cost: z.number().nonnegative().optional(),
  is_active: z.boolean().optional()
})

// Vehicle schemas
export const createVehicleSchema = z.object({
  registration: z.string().min(1, 'Registration is required'),
  depot_id: z.string().uuid('Depot ID must be a valid UUID').optional(),
  make: z.string().optional(),
  vehicle_model: z.string().optional(),
  cost_per_mile: z.number().nonnegative().optional(),
  load_capacity_kg: z.number().nonnegative().optional(),
  is_active: z.boolean().optional()
})

export const updateVehicleSchema = z.object({
  registration: z.string().min(1).optional(),
  depot_id: z.string().uuid('Depot ID must be a valid UUID').optional(),
  make: z.string().optional(),
  vehicle_model: z.string().optional(),
  cost_per_mile: z.number().nonnegative().optional(),
  load_capacity_kg: z.number().nonnegative().optional(),
  is_active: z.boolean().optional()
})

// Route schemas
export const createRouteSchema = z.object({
  operator_id: z.string().uuid('Operator ID must be a valid UUID'),
  depot_id: z.string().uuid('Depot ID must be a valid UUID'),
  vehicle_id: z.string().uuid('Vehicle ID must be a valid UUID').optional(),
  route_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: routeStatusSchema.optional(),
  estimated_duration_minutes: z.number().int().nonnegative().optional(),
  estimated_distance_miles: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

export const updateRouteSchema = z.object({
  operator_id: z.string().uuid('Operator ID must be a valid UUID').optional(),
  vehicle_id: z.string().uuid('Vehicle ID must be a valid UUID').optional(),
  route_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  status: routeStatusSchema.optional(),
  estimated_duration_minutes: z.number().int().nonnegative().optional(),
  estimated_distance_miles: z.number().nonnegative().optional(),
  actual_duration_minutes: z.number().int().nonnegative().optional(),
  actual_distance_miles: z.number().nonnegative().optional(),
  notes: z.string().optional()
})

// Route stop schemas (sub-resource)
export const addRouteStopSchema = z.object({
  lawn_id: z.string().uuid('Lawn ID must be a valid UUID'),
  stop_order: z.number().int().positive(),
  estimated_arrival: z.string().datetime().optional(),
  estimated_departure: z.string().datetime().optional(),
  distance_from_previous_miles: z.number().nonnegative().optional()
})

export const updateRouteStopSchema = z.object({
  stop_order: z.number().int().positive().optional(),
  estimated_arrival: z.string().datetime().optional(),
  estimated_departure: z.string().datetime().optional(),
  actual_arrival: z.string().datetime().optional(),
  actual_departure: z.string().datetime().optional(),
  distance_from_previous_miles: z.number().nonnegative().optional()
})

// Job schemas
export const createJobSchema = z.object({
  lawn_id: z.string().uuid('Lawn ID must be a valid UUID'),
  performed_by: z.string().uuid('Operator ID must be a valid UUID').optional(),
  route_stop_id: z.string().uuid('Route stop ID must be a valid UUID').optional(),
  treatment_plan_item_id: z.string().uuid('Treatment plan item ID must be a valid UUID').optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  lawn_area_sqm: z.number().positive().optional(),
  status: jobStatusSchema.optional(),
  lawn_condition_at_job: lawnConditionSchema.optional(),
  before_notes: z.string().optional(),
  after_notes: z.string().optional()
})

export const updateJobSchema = z.object({
  performed_by: z.string().uuid('Operator ID must be a valid UUID').optional(),
  route_stop_id: z.string().uuid('Route stop ID must be a valid UUID').optional(),
  treatment_plan_item_id: z.string().uuid('Treatment plan item ID must be a valid UUID').optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  lawn_area_sqm: z.number().positive().optional(),
  status: jobStatusSchema.optional(),
  lawn_condition_at_job: lawnConditionSchema.optional(),
  before_notes: z.string().optional(),
  after_notes: z.string().optional(),
  before_photos: z.array(z.string()).optional(),
  after_photos: z.array(z.string()).optional(),
  customer_signature_url: z.string().optional()
})

// Job treatment schemas (sub-resource)
export const addJobTreatmentSchema = z.object({
  treatment_id: z.string().uuid('Treatment ID must be a valid UUID'),
  price_charged: z.number().nonnegative(),
  duration_minutes: z.number().int().nonnegative().optional()
})

// Job consumption schemas (sub-resource)
export const addJobConsumptionSchema = z.object({
  job_treatment_id: z.string().uuid('Job treatment ID must be a valid UUID'),
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  warehouse_id: z.string().uuid('Warehouse ID must be a valid UUID'),
  quantity_consumed: z.number().positive('Quantity must be positive')
})

// Invoice schemas
export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid('Customer ID must be a valid UUID'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  payment_terms_days: z.number().int().nonnegative().optional(),
  vat_rate: z.number().nonnegative().optional(),
  status: invoiceStatusSchema.optional(),
  notes: z.string().optional()
})

export const updateInvoiceSchema = z.object({
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  payment_terms_days: z.number().int().nonnegative().optional(),
  vat_rate: z.number().nonnegative().optional(),
  status: invoiceStatusSchema.optional(),
  notes: z.string().optional()
})

// Invoice item schemas (sub-resource)
export const addInvoiceItemSchema = z.object({
  job_id: z.string().uuid('Job ID must be a valid UUID').optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().nonnegative('Unit price must be non-negative')
})

export const updateInvoiceItemSchema = z.object({
  description: z.string().min(1).optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit_price: z.number().nonnegative('Unit price must be non-negative').optional()
})

// Payment schemas
export const createPaymentSchema = z.object({
  customer_id: z.string().uuid('Customer ID must be a valid UUID'),
  invoice_id: z.string().uuid('Invoice ID must be a valid UUID'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  payment_method: paymentMethodSchema,
  payment_reference: z.string().optional(),
  notes: z.string().optional()
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  payment_method: paymentMethodSchema.optional(),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
  is_confirmed: z.boolean().optional()
})

// Inferred types from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>
export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type SagaOrchestratorRequestInput = z.infer<typeof sagaOrchestratorRequestSchema>
export type SagaPayload = z.infer<typeof sagaPayloadSchema>
export type SagaPayloadItem = z.infer<typeof sagaPayloadItemSchema>
export type SagaStartPayload = z.infer<typeof sagaStartPayloadSchema>
export type SagaStepPayload = z.infer<typeof sagaStepPayloadSchema>

// Lawn care domain inferred types
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type CreateLawnInput = z.infer<typeof createLawnSchema>
export type UpdateLawnInput = z.infer<typeof updateLawnSchema>
export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>
export type AddTreatmentProductInput = z.infer<typeof addTreatmentProductSchema>
export type CreateTreatmentPlanInput = z.infer<typeof createTreatmentPlanSchema>
export type UpdateTreatmentPlanInput = z.infer<typeof updateTreatmentPlanSchema>
export type AddTreatmentPlanItemInput = z.infer<typeof addTreatmentPlanItemSchema>
export type UpdateTreatmentPlanItemInput = z.infer<typeof updateTreatmentPlanItemSchema>
export type CreateOperatorInput = z.infer<typeof createOperatorSchema>
export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>
export type AddRouteStopInput = z.infer<typeof addRouteStopSchema>
export type UpdateRouteStopInput = z.infer<typeof updateRouteStopSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type AddJobTreatmentInput = z.infer<typeof addJobTreatmentSchema>
export type AddJobConsumptionInput = z.infer<typeof addJobConsumptionSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type AddInvoiceItemInput = z.infer<typeof addInvoiceItemSchema>
export type UpdateInvoiceItemInput = z.infer<typeof updateInvoiceItemSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
