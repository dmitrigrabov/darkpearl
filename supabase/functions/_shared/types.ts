import type { Database } from './database.types.ts';

// Re-export Database type for convenience
export type { Database };

// Enum types derived from generated types
export type MovementType = Database['public']['Enums']['movement_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type SagaStatus = Database['public']['Enums']['saga_status'];
export type SagaStepType = Database['public']['Enums']['saga_step_type'];

// Database row types derived from generated types
export type Product = Database['public']['Tables']['products']['Row'];
export type Warehouse = Database['public']['Tables']['warehouses']['Row'];
export type Inventory = Database['public']['Tables']['inventory']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Saga = Database['public']['Tables']['sagas']['Row'];
export type SagaEvent = Database['public']['Tables']['saga_events']['Row'];

// Insert types for creating records
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert'];
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
export type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

// Update types for modifying records
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update'];
export type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

// Request/Response types for API endpoints
export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  unit_price?: number;
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
