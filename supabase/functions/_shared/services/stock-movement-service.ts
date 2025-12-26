import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.ts';
import type { StockMovement, MovementType, CreateStockMovementRequest } from '../types.ts';

type Client = SupabaseClient<Database>;

export interface ListMovementsParams {
  productId?: string;
  warehouseId?: string;
  movementType?: MovementType;
  referenceId?: string;
  correlationId?: string;
  limit?: number;
  offset?: number;
}

export interface StockMovementWithRelations extends StockMovement {
  product: { id: string; sku: string; name: string } | null;
  warehouse: { id: string; code: string; name: string } | null;
}

export async function listMovements(client: Client, params: ListMovementsParams = {}) {
  const {
    productId,
    warehouseId,
    movementType,
    referenceId,
    correlationId,
    limit = 100,
    offset = 0,
  } = params;

  let query = client.from('stock_movements').select(
    `
      *,
      product:products(id, sku, name),
      warehouse:warehouses(id, code, name)
    `,
    { count: 'exact' }
  );

  if (productId) {
    query = query.eq('product_id', productId);
  }
  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }
  if (movementType) {
    query = query.eq('movement_type', movementType);
  }
  if (referenceId) {
    query = query.eq('reference_id', referenceId);
  }
  if (correlationId) {
    query = query.eq('correlation_id', correlationId);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data as StockMovementWithRelations[], count, limit, offset };
}

export async function getMovement(
  client: Client,
  id: string
): Promise<StockMovementWithRelations | null> {
  const { data, error } = await client
    .from('stock_movements')
    .select(`
      *,
      product:products(id, sku, name),
      warehouse:warehouses(id, code, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as StockMovementWithRelations;
}

export async function createMovement(
  client: Client,
  data: CreateStockMovementRequest
): Promise<StockMovement> {
  const correlationId = data.correlation_id || crypto.randomUUID();

  const { data: movement, error } = await client
    .from('stock_movements')
    .insert({
      correlation_id: correlationId,
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      movement_type: data.movement_type,
      quantity: data.quantity,
      reference_id: data.reference_id,
      reference_type: data.reference_type,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return movement;
}

export async function upsertMovement(
  client: Client,
  data: {
    correlation_id: string;
    product_id: string;
    warehouse_id: string;
    movement_type: MovementType;
    quantity: number;
    reference_id?: string;
    reference_type?: string;
    notes?: string;
  }
): Promise<StockMovement | null> {
  const { data: movement, error } = await client
    .from('stock_movements')
    .upsert(
      {
        correlation_id: data.correlation_id,
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        reference_id: data.reference_id,
        reference_type: data.reference_type,
        notes: data.notes,
      },
      {
        onConflict: 'correlation_id,movement_type,product_id,warehouse_id',
        ignoreDuplicates: true,
      }
    )
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return movement;
}

export async function findExistingMovement(
  client: Client,
  correlationId: string,
  movementType: MovementType,
  productId: string,
  warehouseId: string
): Promise<StockMovement | null> {
  const { data, error } = await client
    .from('stock_movements')
    .select('*')
    .eq('correlation_id', correlationId)
    .eq('movement_type', movementType)
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
