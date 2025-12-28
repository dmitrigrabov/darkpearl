import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../_shared/database.types.ts';
import {
  CreateWarehouseSchema,
  UpdateWarehouseSchema,
  type CreateWarehouseInput,
  type UpdateWarehouseInput
} from '../_shared/schemas.ts';
import { supabaseMiddleware } from '../_shared/middleware.ts';
import { zodValidator, getValidatedBody, formatZodError } from '../_shared/validation.ts';
import * as warehouseService from '../_shared/services/warehouse-service.ts';
import { match, P } from 'ts-pattern';

type Env = {
  Variables: {
    supabase: SupabaseClient<Database>;
  };
};

const app = new Hono<Env>();

app.use('/warehouses/*', cors());
app.use('/warehouses/*', supabaseMiddleware);

app.onError((err, c) => {
  console.error('Warehouses error:', err);
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400);
  }
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

app.get('/warehouses', async (c) => {
  const client = c.get('supabase');
  const isActive = c.req.query('is_active');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  const result = await warehouseService.listWarehouses(client, {
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    limit,
    offset,
  });

  return c.json(result);
});

app.get('/warehouses/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const result = await warehouseService.getWarehouse(client, id);

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .otherwise(() => {
      throw result.error;
    });
});

app.post('/warehouses', zodValidator(CreateWarehouseSchema), async (c) => {
  const client = c.get('supabase');
  const body = getValidatedBody<CreateWarehouseInput>(c);

  const result = await warehouseService.createWarehouse(client, body);

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data, 201))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Warehouse with this code already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error;
    });
});

app.put('/warehouses/:id', zodValidator(UpdateWarehouseSchema), async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');
  const body = getValidatedBody<UpdateWarehouseInput>(c);

  const result = await warehouseService.updateWarehouse(client, id, body);

  return match(result)
    .with({ data: P.nonNullable }, () => c.json(result.data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .with({ error: { code: '23505' } }, () =>
      c.json({ error: 'Warehouse with this code already exists' }, 409)
    )
    .otherwise(() => {
      throw result.error;
    });
});

app.delete('/warehouses/:id', async (c) => {
  const client = c.get('supabase');
  const id = c.req.param('id');

  const hasInventory = await warehouseService.hasInventory(client, id);
  if (hasInventory) {
    return c.json({ error: 'Cannot delete warehouse with existing inventory' }, 409);
  }

  const result = await warehouseService.deleteWarehouse(client, id);

  return match(result)
    .with({ data: P.nonNullable }, () => c.json({ message: 'Warehouse deleted' }))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'Warehouse not found' }, 404))
    .otherwise(() => {
      throw result.error;
    });
});

Deno.serve(app.fetch);
