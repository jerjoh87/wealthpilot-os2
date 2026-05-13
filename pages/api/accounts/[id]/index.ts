import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../../lib/api'
import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE'])

  const accountId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!accountId) return err(res, 'Account id is required')

  const db = supabaseAdmin() as any
  const { error } = await db.from('accounts').delete().eq('id', accountId).eq('user_id', user.id)
  if (error) return err(res, error.message)

  return ok(res, { deleted: true, id: accountId })
}
