// Movement types enum matching database
export type MovementType =
  | 'receive'
  | 'transfer_out'
  | 'transfer_in'
  | 'adjust'
  | 'reserve'
  | 'release'
  | 'fulfill';

// Order status enum matching database
export type OrderStatus =
  | 'pending'
  | 'reserved'
  | 'payment_processing'
  | 'payment_failed'
  | 'paid'
  | 'fulfilling'
  | 'fulfilled'
  | 'cancelled';

// Saga types
export type SagaStatus =
  | 'started'
  | 'step_pending'
  | 'step_executing'
  | 'step_completed'
  | 'step_failed'
  | 'compensating'
  | 'compensation_completed'
  | 'completed'
  | 'failed';

export type SagaStepType =
  | 'reserve_stock'
  | 'process_payment'
  | 'fulfill_order'
  | 'release_stock'
  | 'void_payment';

// Database entity types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLevel {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity_available: number;
  quantity_reserved: number;
  reorder_point: number;
  reorder_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  correlation_id: string;
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_id?: string;
  warehouse_id: string;
  total_amount: number;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Saga {
  id: string;
  saga_type: string;
  correlation_id: string;
  status: SagaStatus;
  current_step?: SagaStepType;
  payload: Record<string, unknown>;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface SagaEvent {
  id: string;
  saga_id: string;
  step_type: SagaStepType;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// Request/Response types
export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  unit_price?: number;
  is_active?: boolean;
}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateWarehouseRequest {
  code?: string;
  name?: string;
  address?: string;
  is_active?: boolean;
}

export interface CreateInventoryRequest {
  product_id: string;
  warehouse_id: string;
  quantity_available?: number;
  reorder_point?: number;
  reorder_quantity?: number;
}

export interface UpdateInventoryRequest {
  quantity_available?: number;
  quantity_reserved?: number;
  reorder_point?: number;
  reorder_quantity?: number;
}

export interface CreateStockMovementRequest {
  correlation_id?: string;
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  customer_id?: string;
  warehouse_id: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}

// Saga payload for order fulfillment
export interface OrderFulfillmentPayload {
  order_id: string;
  warehouse_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_reference?: string;
}
