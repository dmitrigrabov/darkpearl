import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { handleCors } from '../_shared/cors.ts';
import {
  jsonResponse,
  errorResponse,
  notFoundResponse,
  methodNotAllowedResponse,
} from '../_shared/response.ts';
import type { CreateInventoryRequest, UpdateInventoryRequest } from '../_shared/types.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const method = req.method;

  // Extract inventory ID from path if present: /inventory/{id}
  const pathParts = url.pathname.split('/').filter(Boolean);
  const inventoryId = pathParts.length > 1 ? pathParts[1] : null;

  try {
    const client = createSupabaseClient(req);
    const serviceClient = createServiceClient();

    switch (method) {
      case 'GET': {
        if (inventoryId) {
          // Get single inventory record with product and warehouse details
          const { data, error } = await client
            .from('inventory')
            .select(`
              *,
              product:products(id, sku, name),
              warehouse:warehouses(id, code, name)
            `)
            .eq('id', inventoryId)
            .single();

          if (error || !data) {
            return notFoundResponse('Inventory');
          }
          return jsonResponse(data);
        } else {
          // List inventory with filters
          const productId = url.searchParams.get('product_id');
          const warehouseId = url.searchParams.get('warehouse_id');
          const lowStock = url.searchParams.get('low_stock');
          const limit = parseInt(url.searchParams.get('limit') || '100');
          const offset = parseInt(url.searchParams.get('offset') || '0');

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
          if (lowStock === 'true') {
            query = query.lte('quantity_available', 'reorder_point');
          }

          const { data, error, count } = await query
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) throw error;
          return jsonResponse({ data, count, limit, offset });
        }
      }

      case 'POST': {
        const body: CreateInventoryRequest = await req.json();

        // Validate required fields
        if (!body.product_id || !body.warehouse_id) {
          return errorResponse('product_id and warehouse_id are required');
        }

        // Check if product and warehouse exist
        const { data: product } = await serviceClient
          .from('products')
          .select('id')
          .eq('id', body.product_id)
          .single();

        if (!product) {
          return errorResponse('Product not found', 404);
        }

        const { data: warehouse } = await serviceClient
          .from('warehouses')
          .select('id')
          .eq('id', body.warehouse_id)
          .single();

        if (!warehouse) {
          return errorResponse('Warehouse not found', 404);
        }

        const { data, error } = await serviceClient
          .from('inventory')
          .insert({
            product_id: body.product_id,
            warehouse_id: body.warehouse_id,
            quantity_available: body.quantity_available || 0,
            quantity_reserved: 0,
            reorder_point: body.reorder_point || 10,
            reorder_quantity: body.reorder_quantity || 50,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return errorResponse('Inventory already exists for this product-warehouse combination', 409);
          }
          throw error;
        }
        return jsonResponse(data, 201);
      }

      case 'PUT': {
        if (!inventoryId) {
          return errorResponse('Inventory ID required for update');
        }

        const body: UpdateInventoryRequest = await req.json();

        // Validate quantity constraints
        if (body.quantity_available !== undefined && body.quantity_available < 0) {
          return errorResponse('quantity_available cannot be negative');
        }
        if (body.quantity_reserved !== undefined && body.quantity_reserved < 0) {
          return errorResponse('quantity_reserved cannot be negative');
        }

        const { data, error } = await serviceClient
          .from('inventory')
          .update(body)
          .eq('id', inventoryId)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return notFoundResponse('Inventory');
          }
          throw error;
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!inventoryId) {
          return errorResponse('Inventory ID required for delete');
        }

        const { error } = await serviceClient
          .from('inventory')
          .delete()
          .eq('id', inventoryId);

        if (error) throw error;
        return jsonResponse({ message: 'Inventory deleted' });
      }

      default:
        return methodNotAllowedResponse();
    }
  } catch (error) {
    console.error('Inventory error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
