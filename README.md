# DarkPearl - Stock Management Backend

A proof-of-concept stock management backend demonstrating the **Saga pattern** for distributed transactions using Supabase and Deno Edge Functions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Edge Functions                     │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  products   │ warehouses  │  inventory  │   orders    │  saga-  │
│   CRUD      │    CRUD     │   CRUD      │  (triggers  │ webhook │
│             │             │             │   saga)     │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
              ▼                                         ▼
┌──────────────────────────┐              ┌─────────────────────────┐
│   Supabase PostgreSQL    │              │      Trigger.dev        │
├──────────────────────────┤    pg_net    ├─────────────────────────┤
│ products | warehouses    │ ──────────►  │   order-saga task       │
│ inventory | stock_movs   │              │   (durable execution)   │
│ orders | order_items     │              └─────────────────────────┘
│ sagas | saga_events      │
└──────────────────────────┘
```

## Order Fulfillment Saga

The system implements an **orchestration-based saga** for order fulfillment:

```
CREATE ORDER → Reserve Stock → Process Payment → Fulfill Order → COMPLETE
                    ↓                ↓
              (on failure)     (on failure)
                    ↓                ↓
              Release Stock ← Void Payment ← COMPENSATE
```

### Saga Steps

1. **Reserve Stock**: Check availability and reserve inventory for each order item
2. **Process Payment**: Mock payment processing (90% success rate for demo)
3. **Fulfill Order**: Deduct stock from inventory, complete the order

### Compensation (on failure)

- **Release Stock**: Return reserved inventory to available pool
- **Void Payment**: Cancel/refund the payment

## Tech Stack

- **Database**: Supabase (PostgreSQL) with declarative schemas
- **API**: Supabase Edge Functions (Deno/TypeScript)
- **Documentation**: TypeSpec → OpenAPI 3
- **Auth**: Supabase Auth with RLS policies

## Getting Started

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Node.js](https://nodejs.org/) (for TypeSpec)
- [Deno](https://deno.land/) (optional, for local function testing)

### Setup

1. **Clone and install dependencies**:
   ```bash
   cd darkpearl
   npm install
   ```

2. **Start Supabase locally**:
   ```bash
   supabase start
   ```

3. **Generate migrations from schemas**:
   ```bash
   supabase db diff --schema public -f initial_schema
   ```

4. **Apply migrations and seed data**:
   ```bash
   supabase db reset
   ```

5. **Start Edge Functions**:
   ```bash
   supabase functions serve
   ```

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/products` | GET, POST, PUT, DELETE | Product catalog management |
| `/warehouses` | GET, POST, PUT, DELETE | Warehouse/location management |
| `/inventory` | GET, POST, PUT, DELETE | Stock level management |
| `/stock-movements` | GET, POST | Stock movement audit trail |
| `/orders` | GET, POST, DELETE | Order management (triggers saga) |

### Testing the Saga

1. **Create an order**:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{
       "warehouse_id": "11111111-1111-1111-1111-111111111111",
       "items": [
         {"product_id": "aaaa1111-1111-1111-1111-111111111111", "quantity": 2, "unit_price": 999.99}
       ]
     }'
   ```

2. **Check order status** (includes saga state):
   ```bash
   curl http://localhost:54321/functions/v1/orders/{order_id} \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

3. **View saga events**:
   ```sql
   SELECT se.*, s.status as saga_status
   FROM saga_events se
   JOIN sagas s ON se.saga_id = s.id
   ORDER BY se.created_at;
   ```

## Key Design Patterns

### Saga Orchestration
Trigger.dev tasks coordinate all saga steps with durable execution. A PostgreSQL trigger fires on order creation, using `pg_net` to call the `saga-webhook` Edge Function, which triggers the saga task. Saga state is persisted in the `sagas` table, with each step recorded in `saga_events` for a complete audit trail.

### Idempotency
All stock movements use a `correlation_id` with a unique constraint. This ensures operations are safe to retry without causing duplicate effects.

### Event Sourcing (Light)
The `saga_events` table provides a complete history of all saga steps. This can be used for debugging, auditing, and potentially replaying state.

## Project Structure

```
darkpearl/
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── schemas/              # Declarative SQL schemas
│   │   ├── 00_extensions.sql
│   │   ├── 01_enums.sql
│   │   ├── 02_products.sql
│   │   ├── 03_warehouses.sql
│   │   ├── 04_inventory.sql
│   │   ├── 05_stock_movements.sql
│   │   ├── 06_orders.sql
│   │   ├── 07_saga_events.sql
│   │   ├── 09_rls_policies.sql
│   │   └── 10_saga_trigger.sql
│   ├── functions/            # Edge Functions
│   │   ├── _shared/          # Shared utilities
│   │   ├── products/
│   │   ├── warehouses/
│   │   ├── inventory/
│   │   ├── stock-movements/
│   │   ├── orders/
│   │   └── saga-webhook/
│   ├── trigger/              # Trigger.dev tasks
│   │   └── order-saga.ts
│   └── seed.sql              # Development seed data
├── typespec/                 # API documentation
│   ├── main.tsp
│   ├── models/
│   └── operations/
├── docs/
│   └── openapi.yaml          # Generated OpenAPI spec
├── package.json
├── deno.json
└── README.md
```

## Scripts

```bash
# Start Supabase
npm run db:start

# Stop Supabase
npm run db:stop

# Reset database (applies migrations and seed)
npm run db:reset

# Generate migration from schema changes
npm run db:diff

# Build TypeSpec to OpenAPI
npm run typespec:build

# Serve Edge Functions locally
npm run functions:serve
```

## Environment Variables

For production deployment, set these in your Supabase project:

- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Anonymous key for public access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for internal functions

## Further Reading

- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Declarative Schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [TypeSpec Documentation](https://typespec.io/)
