import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.ts';
import type { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../types.ts';

type Client = SupabaseClient<Database>;

export interface ListWarehousesParams {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface WarehouseWithInventoryCount extends Warehouse {
  inventory: { count: number }[];
}

export async function listWarehouses(client: Client, params: ListWarehousesParams = {}) {
  const { isActive, limit = 100, offset = 0 } = params;

  let query = client.from('warehouses').select('*', { count: 'exact' });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const { data, error, count } = await query
    .order('code', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: data as Warehouse[], count, limit, offset };
}

export async function getWarehouse(
  client: Client,
  id: string
): Promise<WarehouseWithInventoryCount | null> {
  const { data, error } = await client
    .from('warehouses')
    .select(`
      *,
      inventory:inventory(count)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as WarehouseWithInventoryCount;
}

export async function createWarehouse(
  client: Client,
  data: CreateWarehouseRequest
): Promise<Warehouse> {
  const { data: warehouse, error } = await client
    .from('warehouses')
    .insert({
      code: data.code,
      name: data.name,
      address: data.address,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return warehouse;
}

export async function updateWarehouse(
  client: Client,
  id: string,
  data: UpdateWarehouseRequest
): Promise<Warehouse | null> {
  const { data: warehouse, error } = await client
    .from('warehouses')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return warehouse;
}

export async function hasInventory(client: Client, warehouseId: string): Promise<boolean> {
  const { count } = await client
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('warehouse_id', warehouseId);

  return (count ?? 0) > 0;
}

export async function deleteWarehouse(client: Client, id: string): Promise<void> {
  const { error } = await client.from('warehouses').delete().eq('id', id);
  if (error) throw error;
}

export async function warehouseExists(client: Client, warehouseId: string): Promise<boolean> {
  const { data } = await client
    .from('warehouses')
    .select('id')
    .eq('id', warehouseId)
    .single();

  return !!data;
}
