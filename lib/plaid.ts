import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

const REQUIRED_PLAID_ENV_VARS = [
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'PLAID_ENV',
] as const

export function getMissingPlaidEnvVars() {
  return REQUIRED_PLAID_ENV_VARS.filter((key) => !process.env[key] || !process.env[key]?.trim())
}

export function isPlaidConfigured() {
  return getMissingPlaidEnvVars().length === 0
}

if (!isPlaidConfigured()) {
  console.warn('[WealthPilot] Plaid env vars not set — bank sync disabled')
}

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments ?? 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
      'PLAID-SECRET':    process.env.PLAID_SECRET ?? '',
    },
  },
})

export const plaidClient = new PlaidApi(config)

export const PLAID_PRODUCTS = ((process.env.PLAID_PRODUCTS ?? 'transactions,auth')
  .split(',')
  .map((p) => p.trim().toLowerCase())
  .filter(Boolean) as Products[])

export const PLAID_COUNTRIES = ((process.env.PLAID_COUNTRY_CODES ?? 'US')
  .split(',')
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean) as CountryCode[])

export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI ?? ''

// TODO(PROD): implement robust KMS-backed encryption for Plaid access tokens.
// These stubs intentionally no-op so current flow is not broken in non-prod environments.
export function encryptPlaidToken(accessToken: string) {
  const key = process.env.PLAID_TOKEN_ENCRYPTION_KEY
  if (!key) return accessToken
  return accessToken
}

export function decryptPlaidToken(encryptedToken: string) {
  const key = process.env.PLAID_TOKEN_ENCRYPTION_KEY
  if (!key) return encryptedToken
  return encryptedToken
}
