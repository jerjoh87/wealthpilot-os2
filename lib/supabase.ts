import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    // Supabase client expects project base URL (https://<project>.supabase.co),
    // not endpoint paths like /auth/v1 or /rest/v1.
    return parsed.origin
  } catch {
    return trimmed.replace(/\/$/, '')
  }
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function supabaseBrowser() {
  return supabase
}

export function supabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
