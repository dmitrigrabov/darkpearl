import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types.ts'
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types.ts'

type Client = SupabaseClient<Database>

export interface ListProductsParams {
  isActive?: boolean
  search?: string
  limit?: number
  offset?: number
}

export async function listProducts(client: Client, params: ListProductsParams = {}) {
  const { isActive, search, limit = 100, offset = 0 } = params

  let query = client.from('products').select('*', { count: 'exact' })

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count, limit, offset }
}

export async function getProduct(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<Product>> {
  return await client.from('products').select('*').eq('id', id).single()
}

export async function createProduct(
  client: Client,
  data: CreateProductRequest
): Promise<PostgrestSingleResponse<Product>> {
  return await client
    .from('products')
    .insert({
      sku: data.sku,
      name: data.name,
      description: data.description,
      unit_price: data.unit_price || 0,
      is_active: data.is_active ?? true
    })
    .select()
    .single()
}

export async function updateProduct(
  client: Client,
  id: string,
  data: UpdateProductRequest
): Promise<PostgrestSingleResponse<Product>> {
  return await client.from('products').update(data).eq('id', id).select().single()
}

export async function deleteProduct(
  client: Client,
  id: string
): Promise<PostgrestSingleResponse<null>> {
  return await client.from('products').delete().eq('id', id).select().single()
}

export async function productExists(client: Client, productId: string): Promise<boolean> {
  const { data } = await client.from('products').select('id').eq('id', productId).single()

  return !!data
}
