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
