import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { plaidClient } from '../../../lib/plaid'
import { supabaseAdmin } from '../../../lib/supabase'
import { encryptPlaidToken } from '../../../lib/plaid-crypto'
import { z } from 'zod'

const Schema = z.object({ public_token: z.string().min(1) })

// POST /api/plaid/exchange
// Called after user completes Plaid Link — exchanges public_token for access_token.
// access_token is stored server-side only (never sent to client).
// Then immediately fetches accounts and stores them.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const db = supabaseAdmin()

  try {
    // 1. Exchange public_token → access_token + item_id
    const exchangeRes = await plaidClient.itemPublicTokenExchange({
      public_token: parsed.data.public_token,
    })
    const { access_token, item_id } = exchangeRes.data

    // 2. Encrypt and store the access token
    const encryptedAccessToken = encryptPlaidToken(access_token)
    await db.from('plaid_items').upsert(
      { user_id: user.id, item_id, access_token: encryptedAccessToken, status: 'active' },
      { onConflict: 'item_id' }
    )

    // 3. Immediately fetch and store accounts for this item
    const accountsRes = await plaidClient.accountsGet({ access_token })
    const accountRows = accountsRes.data.accounts.map(a => ({
      user_id:       user.id,
      plaid_item_id: item_id,
      name:          a.name,
      type:          a.type,
      balance:       a.balances.current ?? 0,
      institution:   accountsRes.data.item.institution_id ?? '',
      last4:         a.mask ?? '',
    }))

    await db.from('accounts').upsert(accountRows, { onConflict: 'user_id,plaid_item_id' })

    return ok(res, {
      item_id,
      accounts_synced: accountRows.length,
    }, 201)
  } catch (e: any) {
    return err(res, e?.response?.data?.error_message ?? 'Token exchange failed', 502)
  }
}
