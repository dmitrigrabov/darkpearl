---
name: gen-schema
description: Generate Supabase SQL schema from TypeSpec models (Step 2 of pipeline)
---

# Generate Supabase Schema

This skill generates PostgreSQL schema files from TypeSpec models.

## Prerequisites
- TypeSpec models in `typespec/models/`
- Step 1 (gen-typespec) completed

## Process

1. **Read TypeSpec Models**
   ```bash
   cat typespec/models/*.tsp
   ```

2. **Use Schema Generator Agent**
   Invoke the `supabase-schema-generator` agent to:
   - Map TypeSpec models to PostgreSQL tables
   - Generate enums from TypeSpec enums
   - Add foreign key relationships
   - Include audit columns (created_at, updated_at, created_by)
   - Generate RLS policies

3. **Output Files**
   Create numbered SQL files in `supabase/schemas/`:
   - `XX_enums.sql` - Enum definitions
   - `XX_<entity>.sql` - Table definitions
   - `XX_rls_policies.sql` - Row-level security

4. **Update Manifest**
   Set `steps.supabase-schema.status = "completed"` in `.generation/manifest.json`

## Schema Patterns

### Table Pattern
```sql
CREATE TABLE IF NOT EXISTS <entity> (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- fields from TypeSpec model
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER update_<entity>_updated_at
  BEFORE UPDATE ON <entity>
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### RLS Pattern
```sql
ALTER TABLE <entity> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<entity>_select" ON <entity>
  FOR SELECT USING (auth.uid() IS NOT NULL);
```
