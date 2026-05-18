import type { NextApiRequest, NextApiResponse } from 'next'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'not_configured'
  app: string
  timestamp: string
  environment: string
  checks: {
    supabaseUrl: boolean
    supabaseAnonKey: boolean
    supabaseServiceKey: boolean
    openai: boolean
    plaidClientId: boolean
    plaidSecret: boolean
    tellerApplicationId: boolean
    tellerEnv: boolean
  }
  warnings: string[]
}

const isConfigured = (value: string | undefined) => Boolean(value && value.trim())

export default function handler(_req: NextApiRequest, res: NextApiResponse<HealthPayload>) {
  const checks = {
    supabaseUrl: isConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: isConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceKey: isConfigured(process.env.SUPABASE_SERVICE_ROLE_KEY),
    openai: isConfigured(process.env.OPENAI_API_KEY),
    plaidClientId: isConfigured(process.env.PLAID_CLIENT_ID),
    plaidSecret: isConfigured(process.env.PLAID_SECRET),
    tellerApplicationId: isConfigured(process.env.TELLER_APPLICATION_ID),
    tellerEnv: isConfigured(process.env.TELLER_ENV),
  }

  const warnings: string[] = []
  if (!checks.openai) warnings.push('OPENAI_API_KEY is missing')
  if (!checks.plaidClientId) warnings.push('PLAID_CLIENT_ID is missing')
  if (!checks.plaidSecret) warnings.push('PLAID_SECRET is missing')
  if (!checks.tellerApplicationId) warnings.push('TELLER_APPLICATION_ID is missing')
  if (!checks.tellerEnv) warnings.push('TELLER_ENV is missing')
  if (!checks.supabaseUrl) warnings.push('NEXT_PUBLIC_SUPABASE_URL is missing')
  if (!checks.supabaseAnonKey) warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  if (!checks.supabaseServiceKey) warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing')

  const criticalConfigured = checks.supabaseUrl && checks.supabaseAnonKey && checks.supabaseServiceKey
  const optionalConfigured =
    checks.openai &&
    checks.plaidClientId &&
    checks.plaidSecret &&
    checks.tellerApplicationId &&
    checks.tellerEnv

  const status: HealthPayload['status'] = !criticalConfigured
    ? 'not_configured'
    : optionalConfigured
      ? 'ok'
      : 'degraded'

  return res.status(200).json({
    status,
    app: 'Wealth Budget App',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks,
    warnings,
  })
}
