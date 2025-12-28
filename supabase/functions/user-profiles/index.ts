import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z, ZodError } from 'zod'
import {
  supabaseWithServiceMiddleware,
  type SupabaseWithServiceEnv
} from '../_shared/middleware.ts'
import { zodValidator, formatZodError } from '../_shared/validation.ts'
import { match, P } from 'ts-pattern'

const app = new Hono<SupabaseWithServiceEnv>()

app.use('/user-profiles/*', cors())
app.use('/user-profiles/*', supabaseWithServiceMiddleware)

app.onError((err, c) => {
  console.error('User profiles error:', err)
  if (err instanceof ZodError) {
    return c.json(formatZodError(err), 400)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

// Schema for updating user role
const updateRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'viewer'])
})

// Helper to check if current user is admin
async function isAdmin(supabase: ReturnType<typeof import('../_shared/supabase-client.ts').createSupabaseClient>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

// Get current user's profile
app.get('/user-profiles/me', async c => {
  const { supabase } = c.var

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // Profile might not exist yet for new users
    if (error.code === 'PGRST116') {
      return c.json({ id: user.id, role: 'viewer', email: user.email })
    }
    throw error
  }

  return c.json({ ...data, email: user.email })
})

// List all users with profiles (admin only)
app.get('/user-profiles', async c => {
  const { supabase, serviceClient } = c.var

  // Check if current user is admin
  if (!await isAdmin(supabase)) {
    return c.json({ error: 'Admin access required' }, 403)
  }

  const limit = parseInt(c.req.query('limit') || '100')
  const offset = parseInt(c.req.query('offset') || '0')

  // Use service client to bypass RLS and get all profiles
  const { data: profiles, error: profilesError, count } = await serviceClient
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw profilesError
  }

  // Get user emails from auth.users using service client
  const { data: { users }, error: usersError } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000 // Get all users to match with profiles
  })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    // Return profiles without email if we can't fetch users
    return c.json({
      data: profiles || [],
      count: count || 0,
      limit,
      offset
    })
  }

  // Map emails to profiles
  const userEmailMap = new Map(users.map(u => [u.id, u.email]))
  const profilesWithEmail = (profiles || []).map(profile => ({
    ...profile,
    email: userEmailMap.get(profile.id) || 'Unknown'
  }))

  return c.json({
    data: profilesWithEmail,
    count: count || 0,
    limit,
    offset
  })
})

// Get a specific user profile (admin only)
app.get('/user-profiles/:id', async c => {
  const { supabase, serviceClient } = c.var
  const id = c.req.param('id')

  // Check if current user is admin or requesting their own profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  if (user.id !== id && !await isAdmin(supabase)) {
    return c.json({ error: 'Admin access required' }, 403)
  }

  const { data, error } = await serviceClient
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'User profile not found' }, 404)
    }
    throw error
  }

  // Get user email
  const { data: { user: targetUser } } = await serviceClient.auth.admin.getUserById(id)

  return c.json({ ...data, email: targetUser?.email || 'Unknown' })
})

// Update user role (admin only)
app.put('/user-profiles/:id', zodValidator(updateRoleSchema), async c => {
  const { supabase, serviceClient, body } = c.var
  const id = c.req.param('id')

  // Check if current user is admin
  if (!await isAdmin(supabase)) {
    return c.json({ error: 'Admin access required' }, 403)
  }

  // Prevent admin from demoting themselves (safety check)
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === id && body.role !== 'admin') {
    return c.json({ error: 'Cannot demote your own admin account' }, 400)
  }

  const { data, error } = await serviceClient
    .from('user_profiles')
    .update({ role: body.role })
    .eq('id', id)
    .select()
    .single()

  return match({ data, error })
    .with({ data: P.nonNullable }, () => c.json(data))
    .with({ error: { code: 'PGRST116' } }, () => c.json({ error: 'User profile not found' }, 404))
    .otherwise(() => {
      throw error
    })
})

Deno.serve(app.fetch)
