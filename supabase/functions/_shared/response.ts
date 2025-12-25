import { corsHeaders } from './cors.ts';

/**
 * Creates a JSON response with CORS headers.
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Creates an error response with CORS headers.
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * Creates a not found response.
 */
export function notFoundResponse(resource = 'Resource'): Response {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * Creates a method not allowed response.
 */
export function methodNotAllowedResponse(): Response {
  return errorResponse('Method not allowed', 405);
}
