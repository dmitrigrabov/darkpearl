import type { Database } from './database.types';

// Base types from database
export type Product = Database['public']['Tables']['products']['Row'];
export type Warehouse = Database['public']['Tables']['warehouses']['Row'];
export type Inventory = Database['public']['Tables']['inventory']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type MovementType = Database['public']['Enums']['movement_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];

// Extended types with relations
export interface InventoryWithRelations extends Inventory {
  product: Pick<Product, 'id' | 'sku' | 'name'>;
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
}

export interface StockMovementWithRelations extends StockMovement {
  product: Pick<Product, 'id' | 'sku' | 'name'>;
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
}

export interface OrderWithRelations extends Order {
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
}

export interface SagaEvent {
  id: string;
  step_type: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface OrderDetailWithSaga extends Order {
  items: (OrderItem & { product: Pick<Product, 'id' | 'sku' | 'name'> })[];
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>;
  saga: {
    id: string;
    status: string;
    current_step: string | null;
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
    events: SagaEvent[];
  } | null;
}

// Request types
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

export interface CreateOrderItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderRequest {
  customer_id?: string;
  warehouse_id: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
}

// ============================================
// LAWN DETECTION TYPES
// ============================================

export type Coordinate = {
  latitude: number
  longitude: number
}

export type LawnDetectionRequest = {
  latitude: number
  longitude: number
  zoom?: number
  width?: number
  height?: number
}

export type DetectedLawn = {
  name: string
  boundary: Coordinate[]
  area_sqm: number
  confidence: number
}

export type LawnDetectionResponse = {
  lawns: DetectedLawn[]
}
