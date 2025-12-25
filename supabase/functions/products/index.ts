import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { handleCors } from '../_shared/cors.ts';
import {
  jsonResponse,
  errorResponse,
  notFoundResponse,
  methodNotAllowedResponse,
} from '../_shared/response.ts';
import type { CreateProductRequest, UpdateProductRequest } from '../_shared/types.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const method = req.method;

  // Extract product ID from path if present: /products/{id}
  const pathParts = url.pathname.split('/').filter(Boolean);
  const productId = pathParts.length > 1 ? pathParts[1] : null;

  try {
    const client = createSupabaseClient(req);
    const serviceClient = createServiceClient();

    switch (method) {
      case 'GET': {
        if (productId) {
          // Get single product
          const { data, error } = await client
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

          if (error || !data) {
            return notFoundResponse('Product');
          }
          return jsonResponse(data);
        } else {
          // List products with optional filters
          const isActive = url.searchParams.get('is_active');
          const search = url.searchParams.get('search');
          const limit = parseInt(url.searchParams.get('limit') || '100');
          const offset = parseInt(url.searchParams.get('offset') || '0');

          let query = client.from('products').select('*', { count: 'exact' });

          if (isActive !== null) {
            query = query.eq('is_active', isActive === 'true');
          }
          if (search) {
            query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
          }

          const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) throw error;
          return jsonResponse({ data, count, limit, offset });
        }
      }

      case 'POST': {
        const body: CreateProductRequest = await req.json();

        // Validate required fields
        if (!body.sku || !body.name) {
          return errorResponse('sku and name are required');
        }

        const { data, error } = await serviceClient
          .from('products')
          .insert({
            sku: body.sku,
            name: body.name,
            description: body.description,
            unit_price: body.unit_price || 0,
            is_active: body.is_active ?? true,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return errorResponse('Product with this SKU already exists', 409);
          }
          throw error;
        }
        return jsonResponse(data, 201);
      }

      case 'PUT': {
        if (!productId) {
          return errorResponse('Product ID required for update');
        }

        const body: UpdateProductRequest = await req.json();

        const { data, error } = await serviceClient
          .from('products')
          .update(body)
          .eq('id', productId)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return notFoundResponse('Product');
          }
          if (error.code === '23505') {
            return errorResponse('Product with this SKU already exists', 409);
          }
          throw error;
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!productId) {
          return errorResponse('Product ID required for delete');
        }

        const { error } = await serviceClient
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;
        return jsonResponse({ message: 'Product deleted' });
      }

      default:
        return methodNotAllowedResponse();
    }
  } catch (error) {
    console.error('Products error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
