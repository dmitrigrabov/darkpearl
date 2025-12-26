import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

/**
 * Creates a Supabase client with the user's JWT token from the request.
 * Use this for authenticated endpoints where RLS policies apply.
 */
export function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');

  return createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  );
}

/**
 * Creates a Supabase client with the service role key.
 * Use this for internal operations that bypass RLS (e.g., saga orchestration).
 */
export function createServiceClient() {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}
