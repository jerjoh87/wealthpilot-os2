import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

function normalizeSupabaseUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    return new URL(trimmed).origin
  } catch {
    return trimmed.replace(/\/$/, '')
  }
}

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Browser-safe client (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-only client (uses service role — never expose to client)
export const supabaseAdmin = () => {
  if (!supabaseServiceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
