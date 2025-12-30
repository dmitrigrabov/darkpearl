---
name: gen-typespec
description: Generate TypeSpec API definitions from requirements (Step 1 of pipeline)
---

# Generate TypeSpec API

This skill generates TypeSpec API definitions from business requirements.

## Prerequisites
- Requirements in `.requirements/*.md` files

## Process

1. **Read Requirements**
   ```bash
   cat .requirements/*.md
   ```

2. **Use TypeSpec Agent**
   Invoke the `typespec-api-designer` agent with the requirements to:
   - Analyze business domain and entities
   - Design enums for status fields → `typespec/models/enums.tsp`
   - Create models → `typespec/models/<entity>.tsp`
   - Create operations → `typespec/operations/<entities>.tsp`
   - Update `typespec/main.tsp` with imports

3. **Validate**
   ```bash
   pnpm typespec:build
   ```

4. **Update Manifest**
   Set `steps.typespec.status = "completed"` in `.generation/manifest.json`

## Output Files
- `typespec/models/*.tsp`
- `typespec/operations/*.tsp`
- `typespec/main.tsp` (updated imports)
