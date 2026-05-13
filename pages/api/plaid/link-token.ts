import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRIES, PLAID_REDIRECT_URI, getMissingPlaidEnvVars } from '../../../lib/plaid'

// POST /api/plaid/link-token
// Frontend calls this first → gets link_token → opens Plaid Link UI
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  const missingEnvVars = getMissingPlaidEnvVars()
  if (missingEnvVars.length) {
    return res.status(503).json({
      ok: false,
      code: 'PLAID_NOT_CONFIGURED',
      message: 'Plaid is not configured for this environment.',
      missing: missingEnvVars,
    })
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user:          { client_user_id: user.id },
      client_name:   'WealthPilot OS',
      products:      PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRIES,
      language:      'en',
      ...(PLAID_REDIRECT_URI ? { redirect_uri: PLAID_REDIRECT_URI } : {}),
    })

    return ok(res, { link_token: response.data.link_token })
  } catch (e: any) {
    return err(res, e?.response?.data?.error_message ?? 'Failed to create link token', 502)
  }
}
