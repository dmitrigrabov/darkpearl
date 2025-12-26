# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DarkPearl is a stock management backend built with Supabase Edge Functions (Deno) and PostgreSQL. It implements the Saga pattern for order fulfillment to ensure data consistency across distributed operations.

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

# API Spec
pnpm typespec:build    # Compile TypeSpec to OpenAPI
pnpm typespec:watch    # Watch mode for TypeSpec
```

## Architecture

### Edge Functions (Hono + Deno)

All edge functions use Hono as the web framework and are located in `supabase/functions/`:

- **CRUD endpoints**: `products/`, `warehouses/`, `inventory/`, `stock-movements/`, `orders/`
- **Saga system**: `saga-orchestrator/`, `saga-worker/`

Each function has its own `deno.json` with imports for `@supabase/supabase-js`, `hono`, and `hono/cors`.

### Supabase Client Pattern

Two client types in `_shared/supabase-client.ts`:
- `createSupabaseClient(req)` - Uses user JWT, respects RLS policies
- `createServiceClient()` - Uses service role key, bypasses RLS (for saga operations)

### Saga Pattern for Order Fulfillment

The system uses the Saga pattern with an outbox for reliable event-driven orchestration:

1. **Order creation** (`orders/index.ts`) inserts an order and adds a `saga_start` event to the outbox
2. **Saga worker** (`saga-worker/`) polls the outbox and triggers the orchestrator
3. **Saga orchestrator** (`saga-orchestrator/`) executes steps in sequence:
   - `reserve_stock` → `process_payment` → `fulfill_order`
4. On failure, compensation runs in reverse order:
   - `release_stock` (compensates `reserve_stock`)
   - `void_payment` (compensates `process_payment`)

Key tables: `sagas`, `saga_events`, `outbox`

### Database Schema

Schema files in `supabase/schemas/` (ordered by filename prefix):
- `00_extensions.sql` - UUID extension
- `01_enums.sql` - `movement_type`, `order_status`, `saga_status`, `saga_step_type`
- `02-06_*.sql` - Core domain tables (products, warehouses, inventory, stock_movements, orders)
- `07_saga_events.sql` - Saga state and event store
- `08_outbox.sql` - Outbox pattern for reliable messaging
- `09_rls_policies.sql` - Row-level security policies

### TypeSpec API Definition

TypeSpec files in `typespec/`:
- `main.tsp` - Service definition
- `models/*.tsp` - Data models
- `operations/*.tsp` - API operations

Compiles to OpenAPI at `tsp-output/@typespec/openapi3/openapi.yaml`.

### Types

`_shared/types.ts` re-exports database types from `database.types.ts` (generated via `pnpm db:types`) and defines request/response interfaces.

## Internal Functions Configuration

`saga-orchestrator` and `saga-worker` have `verify_jwt = false` in `supabase/config.toml` as they are called internally with service role key.
