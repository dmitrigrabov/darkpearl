import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { handleCors } from '../_shared/cors.ts';
import {
  jsonResponse,
  errorResponse,
  notFoundResponse,
  methodNotAllowedResponse,
} from '../_shared/response.ts';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '../_shared/types.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const method = req.method;

  // Extract warehouse ID from path if present: /warehouses/{id}
  const pathParts = url.pathname.split('/').filter(Boolean);
  const warehouseId = pathParts.length > 1 ? pathParts[1] : null;

  try {
    const client = createSupabaseClient(req);
    const serviceClient = createServiceClient();

    switch (method) {
      case 'GET': {
        if (warehouseId) {
          // Get single warehouse with inventory summary
          const { data, error } = await client
            .from('warehouses')
            .select(`
              *,
              inventory:inventory(count)
            `)
            .eq('id', warehouseId)
            .single();

          if (error || !data) {
            return notFoundResponse('Warehouse');
          }
          return jsonResponse(data);
        } else {
          // List warehouses
          const isActive = url.searchParams.get('is_active');
          const limit = parseInt(url.searchParams.get('limit') || '100');
          const offset = parseInt(url.searchParams.get('offset') || '0');

          let query = client.from('warehouses').select('*', { count: 'exact' });

          if (isActive !== null) {
            query = query.eq('is_active', isActive === 'true');
          }

          const { data, error, count } = await query
            .order('code', { ascending: true })
            .range(offset, offset + limit - 1);

          if (error) throw error;
          return jsonResponse({ data, count, limit, offset });
        }
      }

      case 'POST': {
        const body: CreateWarehouseRequest = await req.json();

        // Validate required fields
        if (!body.code || !body.name) {
          return errorResponse('code and name are required');
        }

        const { data, error } = await serviceClient
          .from('warehouses')
          .insert({
            code: body.code,
            name: body.name,
            address: body.address,
            is_active: body.is_active ?? true,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return errorResponse('Warehouse with this code already exists', 409);
          }
          throw error;
        }
        return jsonResponse(data, 201);
      }

      case 'PUT': {
        if (!warehouseId) {
          return errorResponse('Warehouse ID required for update');
        }

        const body: UpdateWarehouseRequest = await req.json();

        const { data, error } = await serviceClient
          .from('warehouses')
          .update(body)
          .eq('id', warehouseId)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return notFoundResponse('Warehouse');
          }
          if (error.code === '23505') {
            return errorResponse('Warehouse with this code already exists', 409);
          }
          throw error;
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!warehouseId) {
          return errorResponse('Warehouse ID required for delete');
        }

        // Check if warehouse has inventory
        const { count } = await serviceClient
          .from('inventory')
          .select('*', { count: 'exact', head: true })
          .eq('warehouse_id', warehouseId);

        if (count && count > 0) {
          return errorResponse('Cannot delete warehouse with existing inventory', 409);
        }

        const { error } = await serviceClient
          .from('warehouses')
          .delete()
          .eq('id', warehouseId);

        if (error) throw error;
        return jsonResponse({ message: 'Warehouse deleted' });
      }

      default:
        return methodNotAllowedResponse();
    }
  } catch (error) {
    console.error('Warehouses error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
