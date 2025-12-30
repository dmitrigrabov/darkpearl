---
name: gen-migrations
description: Generate and apply database migrations (Step 4 of pipeline)
---

# Generate Database Migrations

This skill generates migrations from schema files and applies them.

## Prerequisites
- Schema files in `supabase/schemas/`
- Step 2 (gen-schema) completed
- Local Supabase running (`pnpm db:start`)

## Process

1. **Start Supabase** (if not running)
   ```bash
   pnpm db:start
   ```

2. **Generate Migration Diff**
   ```bash
   pnpm db:diff
   ```
   This creates a new migration file in `supabase/migrations/`

3. **Apply Migrations** (Development only)
   ```bash
   pnpm db:reset
   ```
   This resets the database and applies all migrations + seed data.

4. **Generate TypeScript Types**
   ```bash
   pnpm db:types
   ```
   This generates `supabase/functions/_shared/database.types.ts`

5. **Copy Types to Frontend** (if needed)
   ```bash
   cp supabase/functions/_shared/database.types.ts src/types/
   ```

6. **Update Manifest**
   Set `steps.migrations.status = "completed"` in `.generation/manifest.json`

## Output
- `supabase/migrations/<timestamp>_<name>.sql`
- `supabase/functions/_shared/database.types.ts`
- `src/types/database.types.ts` (copy)

## Troubleshooting

If migration fails:
1. Check SQL syntax in schema files
2. Verify enum values match existing data
3. Check foreign key references exist
