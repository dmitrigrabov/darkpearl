---
name: gen-openapi
description: Generate OpenAPI specification from TypeSpec (Step 3 of pipeline)
---

# Generate OpenAPI

This skill compiles TypeSpec definitions into OpenAPI specification.

## Prerequisites
- TypeSpec files in `typespec/`
- Step 1 (gen-typespec) completed

## Process

1. **Compile TypeSpec**
   ```bash
   pnpm typespec:build
   ```

2. **Verify Output**
   Check the generated OpenAPI file:
   ```bash
   head -50 typespec/openapi.yaml
   ```

3. **Update Manifest**
   Set `steps.openapi.status = "completed"` in `.generation/manifest.json`

## Output
- `typespec/openapi.yaml` - Full OpenAPI 3.0 specification

## Troubleshooting

If compilation fails:
1. Check TypeSpec syntax errors in the output
2. Verify all imports in `main.tsp` are correct
3. Ensure model/operation references are valid
