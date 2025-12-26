import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.ts';
import type { Inventory, CreateInventoryRequest, UpdateInventoryRequest } from '../types.ts';

type Client = SupabaseClient<Database>;

export interface ListInventoryParams {
  productId?: string;
  warehouseId?: string;
  lowStock?: boolean;
  limit?: number;
  offset?: number;
}

export interface InventoryWithRelations extends Inventory {
  product: { id: string; sku: string; name: string } | null;
  warehouse: { id: string; code: string; name: string } | null;
}

export async function listInventory(client: Client, params: ListInventoryParams = {}): Promise<{
  data: InventoryWithRelations[];
  count: number | null;
  limit: number;
  offset: number;
}> {
  const { productId, warehouseId, lowStock, limit = 100, offset = 0 } = params;

  let query = client.from('inventory').select(
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
  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const inventoryData: InventoryWithRelations[] = (data ?? []).map((item) => ({
    ...item,
    product: item.product,
    warehouse: item.warehouse,
  }));

  // Filter low stock items in memory (column comparison not supported in Supabase JS client)
  if (lowStock) {
    const filteredData = inventoryData.filter(
      (item) => item.quantity_available <= item.reorder_point
    );
    return { data: filteredData, count: filteredData.length, limit, offset };
  }

  return { data: inventoryData, count, limit, offset };
}

export async function getInventory(
  client: Client,
  id: string
): Promise<InventoryWithRelations | null> {
  const { data, error } = await client
    .from('inventory')
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

  if (!data) return null;

  return {
    ...data,
    product: data.product,
    warehouse: data.warehouse,
  };
}

export async function getInventoryByProductWarehouse(
  client: Client,
  productId: string,
  warehouseId: string
): Promise<Inventory | null> {
  const { data, error } = await client
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createInventory(
  client: Client,
  data: CreateInventoryRequest
): Promise<Inventory> {
  const { data: inventory, error } = await client
    .from('inventory')
    .insert({
      product_id: data.product_id,
      warehouse_id: data.warehouse_id,
      quantity_available: data.quantity_available || 0,
      quantity_reserved: 0,
      reorder_point: data.reorder_point || 10,
      reorder_quantity: data.reorder_quantity || 50,
    })
    .select()
    .single();

  if (error) throw error;
  return inventory;
}

export async function updateInventory(
  client: Client,
  id: string,
  data: UpdateInventoryRequest
): Promise<Inventory | null> {
  const { data: inventory, error } = await client
    .from('inventory')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return inventory;
}

export async function updateInventoryQuantities(
  client: Client,
  id: string,
  quantities: { quantity_available?: number; quantity_reserved?: number }
): Promise<void> {
  const { error } = await client.from('inventory').update(quantities).eq('id', id);
  if (error) throw error;
}

export async function deleteInventory(client: Client, id: string): Promise<void> {
  const { error } = await client.from('inventory').delete().eq('id', id);
  if (error) throw error;
}
