import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

// GET /api/users/me
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const user = await requireUser(req, res)
  if (!user) return

  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('id, email, name, plan, created_at')
    .eq('id', user.id)
    .single()

  if (error) return err(res, error.message)
  return ok(res, data)
}
