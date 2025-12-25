import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { handleCors } from '../_shared/cors.ts';
import {
  jsonResponse,
  errorResponse,
  notFoundResponse,
  methodNotAllowedResponse,
} from '../_shared/response.ts';
import type { CreateStockMovementRequest, MovementType } from '../_shared/types.ts';

const VALID_MOVEMENT_TYPES: MovementType[] = [
  'receive',
  'transfer_out',
  'transfer_in',
  'adjust',
  'reserve',
  'release',
  'fulfill',
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const method = req.method;

  // Extract movement ID from path if present
  const pathParts = url.pathname.split('/').filter(Boolean);
  const movementId = pathParts.length > 1 ? pathParts[1] : null;

  try {
    const client = createSupabaseClient(req);
    const serviceClient = createServiceClient();

    switch (method) {
      case 'GET': {
        if (movementId) {
          // Get single movement with product and warehouse details
          const { data, error } = await client
            .from('stock_movements')
            .select(`
              *,
              product:products(id, sku, name),
              warehouse:warehouses(id, code, name)
            `)
            .eq('id', movementId)
            .single();

          if (error || !data) {
            return notFoundResponse('Stock movement');
          }
          return jsonResponse(data);
        } else {
          // List movements with filters
          const productId = url.searchParams.get('product_id');
          const warehouseId = url.searchParams.get('warehouse_id');
          const movementType = url.searchParams.get('movement_type');
          const referenceId = url.searchParams.get('reference_id');
          const correlationId = url.searchParams.get('correlation_id');
          const limit = parseInt(url.searchParams.get('limit') || '100');
          const offset = parseInt(url.searchParams.get('offset') || '0');

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
          return jsonResponse({ data, count, limit, offset });
        }
      }

      case 'POST': {
        const body: CreateStockMovementRequest = await req.json();

        // Validate required fields
        if (!body.product_id || !body.warehouse_id || !body.movement_type || body.quantity === undefined) {
          return errorResponse('product_id, warehouse_id, movement_type, and quantity are required');
        }

        // Validate movement type
        if (!VALID_MOVEMENT_TYPES.includes(body.movement_type)) {
          return errorResponse(`Invalid movement_type. Must be one of: ${VALID_MOVEMENT_TYPES.join(', ')}`);
        }

        // Get current inventory
        const { data: inventory } = await serviceClient
          .from('inventory')
          .select('*')
          .eq('product_id', body.product_id)
          .eq('warehouse_id', body.warehouse_id)
          .single();

        // Generate correlation ID if not provided
        const correlationId = body.correlation_id || crypto.randomUUID();

        // Calculate new quantities based on movement type
        let newAvailable = inventory?.quantity_available || 0;
        let newReserved = inventory?.quantity_reserved || 0;

        switch (body.movement_type) {
          case 'receive':
          case 'transfer_in':
            newAvailable += body.quantity;
            break;
          case 'transfer_out':
          case 'fulfill':
            newAvailable -= body.quantity;
            if (newAvailable < 0) {
              return errorResponse('Insufficient stock available');
            }
            break;
          case 'adjust':
            newAvailable += body.quantity; // Can be positive or negative
            if (newAvailable < 0) {
              return errorResponse('Adjustment would result in negative stock');
            }
            break;
          case 'reserve':
            if (newAvailable - newReserved < body.quantity) {
              return errorResponse('Insufficient stock to reserve');
            }
            newReserved += body.quantity;
            break;
          case 'release':
            newReserved -= body.quantity;
            if (newReserved < 0) {
              newReserved = 0;
            }
            break;
        }

        // Start transaction-like operation
        // Create or update inventory record
        if (inventory) {
          const { error: updateError } = await serviceClient
            .from('inventory')
            .update({
              quantity_available: newAvailable,
              quantity_reserved: newReserved,
            })
            .eq('id', inventory.id);

          if (updateError) throw updateError;
        } else {
          // Create inventory record if it doesn't exist
          const { error: insertError } = await serviceClient
            .from('inventory')
            .insert({
              product_id: body.product_id,
              warehouse_id: body.warehouse_id,
              quantity_available: newAvailable,
              quantity_reserved: newReserved,
            });

          if (insertError) throw insertError;
        }

        // Record the movement
        const { data: movement, error: movementError } = await serviceClient
          .from('stock_movements')
          .insert({
            correlation_id: correlationId,
            product_id: body.product_id,
            warehouse_id: body.warehouse_id,
            movement_type: body.movement_type,
            quantity: body.quantity,
            reference_id: body.reference_id,
            reference_type: body.reference_type,
            notes: body.notes,
          })
          .select()
          .single();

        if (movementError) {
          // Check for idempotency conflict
          if (movementError.code === '23505') {
            // Return existing movement for idempotent request
            const { data: existing } = await serviceClient
              .from('stock_movements')
              .select('*')
              .eq('correlation_id', correlationId)
              .eq('movement_type', body.movement_type)
              .eq('product_id', body.product_id)
              .eq('warehouse_id', body.warehouse_id)
              .single();

            if (existing) {
              return jsonResponse({ ...existing, idempotent: true });
            }
          }
          throw movementError;
        }

        return jsonResponse(movement, 201);
      }

      default:
        return methodNotAllowedResponse();
    }
  } catch (error) {
    console.error('Stock movements error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
