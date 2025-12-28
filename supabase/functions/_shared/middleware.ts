import { createMiddleware } from 'hono/factory'
import { createSupabaseClient, createServiceClient } from './supabase-client.ts'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'

export type SupabaseEnv = {
  Variables: {
    supabase: SupabaseClient<Database>
  }
}

export type SupabaseWithServiceEnv = {
  Variables: {
    supabase: SupabaseClient<Database>
    serviceClient: SupabaseClient<Database>
  }
}

export const supabaseMiddleware = createMiddleware<SupabaseEnv>(async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw))
  await next()
})

export const supabaseWithServiceMiddleware = createMiddleware<SupabaseWithServiceEnv>(async (c, next) => {
  c.set('supabase', createSupabaseClient(c.req.raw))
  c.set('serviceClient', createServiceClient())
  await next()
})
