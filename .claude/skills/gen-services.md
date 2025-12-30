---
name: gen-services
description: Generate backend service layer connecting DB to routes (Step 7 of pipeline)
---

# Generate Backend Services

This skill generates service files that connect Supabase database to Hono routes.

## Prerequisites
- TypeSpec operations in `typespec/operations/`
- Database types at `supabase/functions/_shared/database.types.ts`
- Steps 1-4 completed

## Process

1. **Use Services Generator Agent**
   Invoke the `backend-services-generator` agent to:
   - Read TypeSpec operations for business logic
   - Read database.types.ts for type-safe queries
   - Generate service functions for each operation

2. **Output Location**
   `supabase/functions/_shared/services/<entity>.service.ts`

3. **Generated Pattern**
   ```typescript
   // services/customers.service.ts
   import type { SupabaseClient } from '@supabase/supabase-js'
   import type { Database } from '../database.types'

   type Client = SupabaseClient<Database>

   export type ListCustomersParams = {
     is_active?: boolean
     search?: string
     limit?: number
     offset?: number
   }

   export const listCustomers = async (
     client: Client,
     params: ListCustomersParams
   ) => {
     let query = client
       .from('customers')
       .select('*', { count: 'exact' })

     if (params.is_active !== undefined) {
       query = query.eq('is_active', params.is_active)
     }

     if (params.search) {
       query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`)
     }

     const { data, error, count } = await query
       .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 100) - 1)
       .order('created_at', { ascending: false })

     if (error) throw error

     return {
       data,
       count: count ?? 0,
       limit: params.limit ?? 100,
       offset: params.offset ?? 0
     }
   }

   export const getCustomer = async (client: Client, id: string) => {
     const { data, error } = await client
       .from('customers')
       .select('*')
       .eq('id', id)
       .single()

     if (error) throw error
     return data
   }

   export const createCustomer = async (
     client: Client,
     request: Database['public']['Tables']['customers']['Insert']
   ) => {
     const { data, error } = await client
       .from('customers')
       .insert(request)
       .select()
       .single()

     if (error) throw error
     return data
   }
   ```

4. **Update Manifest**
   Set `steps.services.status = "completed"` in `.generation/manifest.json`

## Integration

Connect services to routes:
```typescript
// In route handler
import { listCustomers } from '../services/customers.service'

app.get('/customers', async (c) => {
  const client = createSupabaseClient(c.req)
  const params = c.req.query()
  const result = await listCustomers(client, params)
  return c.json(result)
})
```
