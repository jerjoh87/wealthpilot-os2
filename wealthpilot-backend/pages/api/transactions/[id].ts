// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

// PUT    /api/transactions/:id  — update category only (Plaid txs are read-only otherwise)
// DELETE /api/transactions/:id  — only allowed for manual entries (no plaid_tx_id)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query
  const db = supabaseAdmin()

  if (req.method === 'PUT') {
    const { category } = req.body
    if (!category || typeof category !== 'string') return err(res, 'category required')

    const { data, error } = await db
      .from('transactions')
      .update({ category })
      .eq('id', id as string)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    // Prevent deleting Plaid-synced transactions
    const { data: tx } = await db
      .from('transactions')
      .select('plaid_tx_id')
      .eq('id', id as string)
      .eq('user_id', user.id)
      .single()

    if (tx?.plaid_tx_id) return err(res, 'Cannot delete Plaid-synced transactions', 403)

    const { error } = await db
      .from('transactions')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id)

    if (error) return err(res, error.message)
    return ok(res, { deleted: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
