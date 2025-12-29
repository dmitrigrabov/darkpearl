import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ZodError } from 'zod'
import { supabaseMiddleware } from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { lawnDetectionRequestSchema } from '../_shared/schemas.ts'
import * as lawnDetectionService from '../_shared/services/lawn-detection-service.ts'
import type { SupabaseEnv } from '../_shared/types.ts'

const app = new Hono<SupabaseEnv>()

app.use('/*', cors())
app.use('/*', supabaseMiddleware)

app.onError((err, c) => {
  console.error('Lawn detection error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

// Analyze satellite image for lawn boundaries
app.post('/lawn-detection/detect', zodValidator(lawnDetectionRequestSchema), async (c) => {
  const { body } = c.var

  try {
    // Apply defaults for optional fields
    const params = {
      latitude: body.latitude,
      longitude: body.longitude,
      zoom: body.zoom ?? 19,
      width: body.width ?? 640,
      height: body.height ?? 640,
    }

    console.log('Detecting lawns for coordinates:', params)

    const lawns = await lawnDetectionService.detectLawns(params)

    console.log(`Detected ${lawns.length} lawn(s)`)

    return c.json({ lawns })
  } catch (error) {
    console.error('Lawn detection failed:', error)

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('API_KEY')) {
        return c.json({ error: 'Service configuration error' }, 503)
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return c.json({ error: 'Service temporarily unavailable' }, 429)
      }
    }

    throw error
  }
})

// Health check endpoint
app.get('/lawn-detection/health', (c) => {
  return c.json({
    status: 'ok',
    hasGoogleMapsKey: !!Deno.env.get('GOOGLE_MAPS_API_KEY'),
    hasGeminiKey: !!Deno.env.get('GOOGLE_GEMINI_API_KEY'),
  })
})

Deno.serve(app.fetch)
