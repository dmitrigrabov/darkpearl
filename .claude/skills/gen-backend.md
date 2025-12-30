---
name: gen-backend
description: Generate Hono route handlers from OpenAPI (Step 5 of pipeline)
---

# Generate Backend Routes

This skill generates Hono route handlers with Zod validation from OpenAPI spec.

## Prerequisites
- OpenAPI spec at `typespec/openapi.yaml`
- Step 3 (gen-openapi) completed

## Process

1. **Bundle SKMTC Generators**
   ```bash
   skmtc bundle backend
   ```
   This bundles all generators in `.skmtc/backend/` into a single worker.

2. **Generate Code from OpenAPI**
   ```bash
   skmtc generate backend typespec/openapi.yaml
   ```
   The gen-supabase-hono generator reads the OpenAPI spec and generates:
   - Route handler functions
   - Zod validation schemas
   - Request/response type bindings

3. **Output Location**
   - `supabase/functions/_shared/routes.generated.ts`
   - `supabase/functions/_shared/models.generated.ts`

4. **Generated Pattern**
   ```typescript
   import { Hono } from 'hono'
   import { zValidator } from '@hono/zod-validator'
   import { listCustomersQuerySchema, createCustomerRequestSchema } from './models.generated'

   export const customersRoutes = new Hono()
     .get('/', zValidator('query', listCustomersQuerySchema), async (c) => {
       // Handler implementation goes in service
     })
     .post('/', zValidator('json', createCustomerRequestSchema), async (c) => {
       // Handler implementation goes in service
     })
   ```

5. **Update Manifest**
   Set `steps.skmtc-backend.status = "completed"` in `.generation/manifest.json`

## Integration

Import generated routes in your Edge Function:
```typescript
// supabase/functions/api/index.ts
import { customersRoutes } from '../_shared/routes.generated'

app.route('/customers', customersRoutes)
```
