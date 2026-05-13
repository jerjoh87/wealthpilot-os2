import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../../lib/api'
import { supabaseAdmin } from '../../../../lib/supabase'
import { plaidClient, getMissingPlaidEnvVars } from '../../../../lib/plaid'
import { decryptPlaidToken } from '../../../../lib/plaid-crypto'

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

  const accountId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!accountId) return err(res, 'Account id is required')

  const db = supabaseAdmin() as any
  const { data: account, error: accountErr } = await db
    .from('accounts')
    .select('id, plaid_account_id, plaid_item_id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (accountErr || !account) return err(res, 'Account not found', 404)
  if (!account.plaid_item_id || !account.plaid_account_id) return err(res, 'Account is not linked to Plaid', 400)

  const { data: item, error: itemErr } = await db
    .from('plaid_items')
    .select('access_token')
    .eq('item_id', account.plaid_item_id)
    .eq('user_id', user.id)
    .single()

  if (itemErr || !item) return err(res, 'Plaid item not found for account', 404)

  try {
    const accessToken = decryptPlaidToken(item.access_token)
    const accRes = await plaidClient.accountsGet({ access_token: accessToken })
    const plaidAccount = accRes.data.accounts.find((a) => a.account_id === account.plaid_account_id)

    if (!plaidAccount) return err(res, 'Plaid account not found during sync', 404)

    const { error: updateErr } = await db
      .from('accounts')
      .update({ balance: plaidAccount.balances.current ?? 0 })
      .eq('id', account.id)
      .eq('user_id', user.id)

    if (updateErr) return err(res, updateErr.message)

    return ok(res, { synced: true, account_id: account.id, balance: plaidAccount.balances.current ?? 0 })
  } catch (e: any) {
    return err(res, e?.response?.data?.error_message ?? 'Account sync failed', 502)
  }
}
