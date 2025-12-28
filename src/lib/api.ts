import { supabase } from './supabase';
import type {
  Product,
  Warehouse,
  Inventory,
  InventoryWithRelations,
  StockMovement,
  StockMovementWithRelations,
  Order,
  OrderWithRelations,
  OrderDetailWithSaga,
  PaginatedResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  CreateStockMovementRequest,
  CreateOrderRequest,
  MovementType,
  OrderStatus,
} from '@/types/api.types';
import type {
  RouteStatus,
  JobStatus,
  RouteWithRelations,
  RouteDetailWithStops,
  JobWithRelations,
  Operator,
} from '@/types/schedule.types';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PaginationParams {
  limit?: number;
  offset?: number;
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Products API
export const productsApi = {
  list: (params?: PaginationParams & { is_active?: boolean; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
    if (params?.search) searchParams.set('search', params.search);
    return fetchWithAuth<PaginatedResponse<Product>>(`/products?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<Product>(`/products/${id}`),
  create: (data: CreateProductRequest) =>
    fetchWithAuth<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateProductRequest) =>
    fetchWithAuth<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

// Warehouses API
export const warehousesApi = {
  list: (params?: PaginationParams & { is_active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
    return fetchWithAuth<PaginatedResponse<Warehouse>>(`/warehouses?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<Warehouse>(`/warehouses/${id}`),
  create: (data: CreateWarehouseRequest) =>
    fetchWithAuth<Warehouse>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateWarehouseRequest) =>
    fetchWithAuth<Warehouse>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth<{ message: string }>(`/warehouses/${id}`, { method: 'DELETE' }),
};

// Inventory API
export const inventoryApi = {
  list: (
    params?: PaginationParams & { product_id?: string; warehouse_id?: string; low_stock?: boolean }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.product_id) searchParams.set('product_id', params.product_id);
    if (params?.warehouse_id) searchParams.set('warehouse_id', params.warehouse_id);
    if (params?.low_stock) searchParams.set('low_stock', 'true');
    return fetchWithAuth<PaginatedResponse<InventoryWithRelations>>(`/inventory?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<InventoryWithRelations>(`/inventory/${id}`),
  create: (data: CreateInventoryRequest) =>
    fetchWithAuth<Inventory>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateInventoryRequest) =>
    fetchWithAuth<Inventory>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth<{ message: string }>(`/inventory/${id}`, { method: 'DELETE' }),
};

// Stock Movements API
export const stockMovementsApi = {
  list: (
    params?: PaginationParams & {
      product_id?: string;
      warehouse_id?: string;
      movement_type?: MovementType;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.product_id) searchParams.set('product_id', params.product_id);
    if (params?.warehouse_id) searchParams.set('warehouse_id', params.warehouse_id);
    if (params?.movement_type) searchParams.set('movement_type', params.movement_type);
    return fetchWithAuth<PaginatedResponse<StockMovementWithRelations>>(
      `/stock-movements?${searchParams}`
    );
  },
  get: (id: string) => fetchWithAuth<StockMovementWithRelations>(`/stock-movements/${id}`),
  create: (data: CreateStockMovementRequest) =>
    fetchWithAuth<StockMovement>('/stock-movements', { method: 'POST', body: JSON.stringify(data) }),
};

// Orders API
export const ordersApi = {
  list: (params?: PaginationParams & { status?: OrderStatus; customer_id?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customer_id) searchParams.set('customer_id', params.customer_id);
    return fetchWithAuth<PaginatedResponse<OrderWithRelations>>(`/orders?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<OrderDetailWithSaga>(`/orders/${id}`),
  create: (data: CreateOrderRequest) =>
    fetchWithAuth<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id: string) => fetchWithAuth<{ message: string }>(`/orders/${id}`, { method: 'DELETE' }),
};

// User role type
export type UserRole = 'admin' | 'manager' | 'viewer';

// User profile with email
export interface UserProfileWithEmail {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
}

// User Profiles API (admin only)
export const userProfilesApi = {
  me: () => fetchWithAuth<UserProfileWithEmail>('/user-profiles/me'),
  list: (params?: PaginationParams) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    return fetchWithAuth<PaginatedResponse<UserProfileWithEmail>>(`/user-profiles?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<UserProfileWithEmail>(`/user-profiles/${id}`),
  updateRole: (id: string, role: UserRole) =>
    fetchWithAuth<UserProfileWithEmail>(`/user-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};

// Routes API
export const routesApi = {
  list: (
    params?: PaginationParams & {
      route_date?: string;
      date_from?: string;
      date_to?: string;
      status?: RouteStatus;
      operator_id?: string;
      depot_id?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.route_date) searchParams.set('route_date', params.route_date);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.operator_id) searchParams.set('operator_id', params.operator_id);
    if (params?.depot_id) searchParams.set('depot_id', params.depot_id);
    return fetchWithAuth<PaginatedResponse<RouteWithRelations>>(`/routes?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<RouteDetailWithStops>(`/routes/${id}`),
};

// Jobs API
export const jobsApi = {
  list: (
    params?: PaginationParams & {
      scheduled_date?: string;
      date_from?: string;
      date_to?: string;
      status?: JobStatus;
      operator_id?: string;
      lawn_id?: string;
      customer_id?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.scheduled_date) searchParams.set('scheduled_date', params.scheduled_date);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.operator_id) searchParams.set('operator_id', params.operator_id);
    if (params?.lawn_id) searchParams.set('lawn_id', params.lawn_id);
    if (params?.customer_id) searchParams.set('customer_id', params.customer_id);
    return fetchWithAuth<PaginatedResponse<JobWithRelations>>(`/jobs?${searchParams}`);
  },
  get: (id: string) => fetchWithAuth<JobWithRelations>(`/jobs/${id}`),
};

// Operators API (for dropdowns)
export const operatorsApi = {
  list: (params?: PaginationParams & { is_active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
    return fetchWithAuth<PaginatedResponse<Operator>>(`/operators?${searchParams}`);
  },
};
