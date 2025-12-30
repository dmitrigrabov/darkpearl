---
name: generate-app
description: Full app generation pipeline from markdown requirements to running application
---

# App Generation Pipeline Orchestrator

You are orchestrating a multi-step code generation pipeline that transforms business requirements into a fully scaffolded application.

## Pipeline Overview

```
Requirements (Markdown) → TypeSpec API → Supabase Schema → Migrations →
OpenAPI → SKMTC Backend → SKMTC Frontend → Services
```

## Step-by-Step Execution

### Step 1: Check Requirements
First, check if requirements exist in `.requirements/` folder:

```bash
ls -la .requirements/
```

If no requirements exist, ask the user to describe their application. Create markdown files:
- `.requirements/overview.md` - Business domain, industry, target users
- `.requirements/entities.md` - Key entities and their relationships
- `.requirements/features.md` - Core features and functionality

### Step 2: Read Manifest
Check the current pipeline state:

```bash
cat .generation/manifest.json
```

### Step 3: Execute Steps in Order

For each pending step, execute in order. Steps can run independently:

#### Step 1: TypeSpec API Design
Use the `typespec-api-designer` agent to generate API definitions:
- Read requirements from `.requirements/*.md`
- Generate models in `typespec/models/`
- Generate operations in `typespec/operations/`
- Update `typespec/main.tsp` with imports
- Validate: `pnpm typespec:build`

#### Step 2: Supabase Schema
Use the `supabase-schema-generator` agent to generate database schema:
- Read TypeSpec models
- Generate SQL in `supabase/schemas/`
- Include enums, tables, RLS policies

#### Step 3: OpenAPI Generation
Run TypeSpec compilation:
```bash
pnpm typespec:build
```

#### Step 4: Database Migrations
Apply schema changes:
```bash
pnpm db:diff      # Generate migration
pnpm db:reset     # Apply (dev only)
pnpm db:types     # Generate TS types
```

#### Step 5: SKMTC Backend
Run SKMTC with gen-hono generator:
- Generate Hono route handlers
- Include Zod validation middleware
- Output to `supabase/functions/_shared/routes.generated.ts`

#### Step 6: SKMTC Frontend
Run SKMTC with gen-react-query generator:
- Generate React Query hooks
- Include typed API client
- Output to `src/hooks/api.generated.ts`

#### Step 7: Backend Services
Use the `backend-services-generator` agent:
- Read TypeSpec operations and database.types.ts
- Generate service files connecting DB to routes
- Output to `supabase/functions/_shared/services/`

### Step 4: Update Manifest
After each step, update `.generation/manifest.json`:
- Set step status to "completed"
- Record timestamp
- List generated files

## Individual Step Commands

Users can run individual steps:
- `/gen-typespec` - Step 1 only
- `/gen-schema` - Step 2 only
- `/gen-openapi` - Step 3 only
- `/gen-migrations` - Step 4 only
- `/gen-backend` - Step 5 only
- `/gen-frontend` - Step 6 only
- `/gen-services` - Step 7 only

## Resuming Pipeline

If a step fails:
1. Fix the issue
2. Re-run that specific step
3. Continue with remaining steps

The manifest tracks progress, allowing safe re-runs.

## Validation Checkpoints

After completing all steps, verify:
1. `pnpm typespec:build` succeeds (no TypeSpec errors)
2. `pnpm db:reset` succeeds (valid SQL)
3. `pnpm build` succeeds (valid TypeScript)
4. All generated files have no type errors

## Example Interaction

User: "Generate an app for a pet grooming salon"

1. Create requirements in `.requirements/`:
   - overview.md: Pet grooming business, appointments, services, customers
   - entities.md: Customer, Pet, Service, Appointment, Staff
   - features.md: Booking, scheduling, payment, customer portal

2. Run pipeline steps sequentially
3. Update manifest after each step
4. Report progress and any issues

## Error Handling

If a step fails:
1. Report the error clearly
2. Suggest fixes
3. Offer to retry or skip to next step
4. Update manifest with error status
