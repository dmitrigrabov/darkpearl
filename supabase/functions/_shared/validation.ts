import * as z from 'zod'
import { createMiddleware } from 'hono/factory'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationErrorResponse {
  error: string
  errors: ValidationError[]
}

/**
 * Hono middleware factory for Zod schema validation of JSON request bodies.
 * Uses createMiddleware for proper type inference - validated body is accessible
 * via c.var.body with full type safety.
 *
 * Returns 400 with structured errors if validation fails.
 */
export const zodValidator = <T extends z.ZodSchema>(schema: T) =>
  createMiddleware<{
    Variables: {
      body: z.output<T>
    }
  }>(async (c, next) => {
    let data: unknown
    try {
      data = await c.req.json()
    } catch {
      return c.json(
        {
          error: 'Invalid JSON body',
          errors: [{ path: '', message: 'Request body must be valid JSON' }]
        } satisfies ValidationErrorResponse,
        400
      )
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      const errors: ValidationError[] = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return c.json({ error: 'Validation failed', errors } satisfies ValidationErrorResponse, 400)
    }

    c.set('body', result.data)
    await next()
  })

/**
 * Formats a ZodError into the standard validation error response format.
 * Useful for error handlers that need to catch ZodErrors as a fallback.
 */
export function formatZodError(error: z.ZodError): ValidationErrorResponse {
  const errors: ValidationError[] = error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message
  }))
  return { error: 'Validation failed', errors }
}
