# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DarkPearl is a stock management system with:
- **Backend**: Supabase Edge Functions (Deno/Hono) + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS + TanStack Query
- **Background Jobs**: Trigger.dev for durable saga execution

The system implements the Saga pattern for order fulfillment to ensure data consistency across distributed operations.

## Commands

```bash
# Database
pnpm db:start          # Start local Supabase
pnpm db:stop           # Stop local Supabase
pnpm db:reset          # Reset database (applies migrations + seed)
pnpm db:diff           # Generate migration diff
pnpm db:types          # Regenerate TypeScript types from database

# Edge Functions
pnpm functions:serve   # Start local function development server

# Frontend
pnpm dev               # Start Vite dev server (localhost:5173)
pnpm build             # Build for production

# Trigger.dev
pnpm trigger:dev       # Start local Trigger.dev dev server
pnpm trigger:deploy    # Deploy tasks to Trigger.dev

# API Spec
pnpm typespec:build    # Compile TypeSpec to OpenAPI
pnpm typespec:watch    # Watch mode for TypeSpec
```

## Architecture

### Frontend (React + Vite)

Located in `src/`:
- `pages/` - Route pages (products, warehouses, inventory, orders, etc.)
- `components/` - UI components (shadcn/ui style) and layouts
- `hooks/` - TanStack Query hooks for data fetching (e.g., `use-products.ts`)
- `lib/api.ts` - API client using fetch
- `lib/supabase.ts` - Supabase client for auth
- `providers/` - React context providers (Auth, Query)
- `types/` - TypeScript type definitions

Auth flow uses Supabase Auth with Google OAuth, callback at `/auth/callback`.

### Edge Functions (Hono + Deno)

All edge functions use Hono and are in `supabase/functions/`:

- **CRUD endpoints**: `products/`, `warehouses/`, `inventory/`, `stock-movements/`, `orders/`
- **Saga system**: `saga-webhook/` (triggers Trigger.dev tasks)

Each function has its own `deno.json`. Shared code in `_shared/`:
- `supabase-client.ts` - Two client types:
  - `createSupabaseClient(req)` - Uses user JWT, respects RLS
  - `createServiceClient()` - Bypasses RLS (for saga operations)
- `services/` - Business logic services
- `schemas.ts` - Zod validation schemas
- `middleware.ts` - Hono middleware

### Saga Pattern for Order Fulfillment

Flow triggered by order creation:

1. **Order creation** (`orders/index.ts`) inserts an order
2. **PostgreSQL trigger** (`trigger_order_saga`) fires and uses `pg_net` to call `saga-webhook`
3. **Saga webhook** triggers `orderFulfillmentSaga` task on Trigger.dev
4. **Trigger.dev task** (`supabase/trigger/orderFulfillmentSaga.ts`) executes steps:
   - `reserve_stock` → `process_payment` → `fulfill_order`
5. On failure, `compensateOrderSaga` runs compensations in reverse:
   - `release_stock` (compensates `reserve_stock`)
   - `void_payment` (compensates `process_payment`)

Task files in `supabase/trigger/`:
- `orderFulfillmentSaga.ts` - Main saga orchestrator
- `steps/` - Individual saga steps
- `compensation/` - Compensation tasks
- `supabase.ts` - DB operations for saga state
- `types.ts` - Payload types

Key tables: `sagas`, `saga_events`

### Database Schema

Schema files in `supabase/schemas/` (ordered by filename prefix):
- `00_extensions.sql` - UUID extension
- `01_enums.sql` - `movement_type`, `order_status`, `saga_status`, `saga_step_type`
- `02-06_*.sql` - Core domain tables (products, warehouses, inventory, stock_movements, orders)
- `07_saga_events.sql` - Saga state and event store
- `09_rls_policies.sql` - Row-level security policies
- `10_saga_trigger.sql` - PostgreSQL trigger for saga via pg_net

### TypeSpec API Definition

TypeSpec files in `typespec/`:
- `main.tsp` - Service definition
- `models/*.tsp` - Data models
- `operations/*.tsp` - API operations

Compiles to OpenAPI at `tsp-output/@typespec/openapi3/openapi.yaml`.

### Types

- `supabase/functions/_shared/types.ts` - Re-exports from `database.types.ts` (generated via `pnpm db:types`)
- `src/types/database.types.ts` - Frontend copy of database types
- `src/types/api.types.ts` - API request/response interfaces

## Configuration Notes

- `saga-webhook` has `verify_jwt = false` in `supabase/config.toml` (called from PostgreSQL triggers via pg_net)
- Trigger.dev config in `trigger.config.ts` - tasks dir is `./supabase/trigger`
- Auth redirects configured for `localhost:5173` in `supabase/config.toml`
