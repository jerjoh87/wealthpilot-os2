import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
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

export const PLAID_PRODUCTS    = [Products.Transactions, Products.Auth] as Products[]
export const PLAID_COUNTRIES   = [CountryCode.Us] as CountryCode[]
export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI ?? ''
