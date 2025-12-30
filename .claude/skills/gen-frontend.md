---
name: gen-frontend
description: Generate React Query hooks from OpenAPI (Step 6 of pipeline)
---

# Generate Frontend Hooks

This skill generates React Query hooks and typed API client from OpenAPI spec.

## Prerequisites
- OpenAPI spec at `typespec/openapi.yaml`
- Step 3 (gen-openapi) completed

## Process

1. **Bundle SKMTC Generators**
   ```bash
   skmtc bundle frontend
   ```
   This bundles all generators in `.skmtc/frontend/` into a single worker.

2. **Generate Code from OpenAPI**
   ```bash
   skmtc generate frontend typespec/openapi.yaml
   ```
   The gen-tanstack-query-supabase-zod generator reads the OpenAPI spec and generates:
   - React Query hooks (useQuery, useMutation)
   - Typed API client functions
   - Request/response types with Zod schemas

3. **Output Location**
   - `src/hooks/api.generated.ts`
   - `src/types/api.generated.ts`

4. **Generated Pattern**
   ```typescript
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
   import { api } from '@/lib/api'
   import type { Customer, CreateCustomerRequest, CustomerListResponse } from './types.generated'

   // Query hooks
   export const useCustomers = (params?: { limit?: number; offset?: number }) =>
     useQuery({
       queryKey: ['customers', params],
       queryFn: () => api.get<CustomerListResponse>('/customers', { params })
     })

   export const useCustomer = (id: string) =>
     useQuery({
       queryKey: ['customers', id],
       queryFn: () => api.get<Customer>(`/customers/${id}`)
     })

   // Mutation hooks
   export const useCreateCustomer = () => {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: (data: CreateCustomerRequest) =>
         api.post<Customer>('/customers', data),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['customers'] })
       }
     })
   }
   ```

5. **Update Manifest**
   Set `steps.skmtc-frontend.status = "completed"` in `.generation/manifest.json`

## Usage

```tsx
import { useCustomers, useCreateCustomer } from '@/hooks/api.generated'

function CustomerList() {
  const { data, isLoading } = useCustomers()
  const createCustomer = useCreateCustomer()

  // ...
}
```
