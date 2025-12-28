import * as z from 'zod'
import type { Context, MiddlewareHandler } from 'hono'

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
 * Validates the request body against the provided schema and stores the
 * validated data in the context for retrieval via getValidatedBody().
 *
 * Returns 400 with structured errors if validation fails.
 */
export function zodValidator<T extends z.ZodSchema>(schema: T): MiddlewareHandler {
  return async (c, next) => {
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

    c.set('validatedBody', result.data)
    await next()
  }
}

/**
 * Retrieves the validated request body from the Hono context.
 * Must be used after zodValidator middleware.
 */
export function getValidatedBody<T>(c: Context): T {
  return c.get('validatedBody') as T
}

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
