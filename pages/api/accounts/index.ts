import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const db = supabaseAdmin() as any
  const { data, error } = await db
    .from('accounts')
    .select('id, name, type, balance, institution, last4, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return err(res, error.message)

  return ok(res, data ?? [])
}
