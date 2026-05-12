// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

// PUT /api/budgets/:id  — update limit only
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT'])

  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query
  const { limit } = req.body
  if (typeof limit !== 'number' || limit <= 0) return err(res, 'Invalid limit')

  const { data, error } = await supabaseAdmin()
    .from('budgets')
    .update({ limit })
    .eq('id', id as string)
    .eq('user_id', user.id)   // RLS — users can only update their own
    .select().single()

  if (error) return err(res, error.message)
  return ok(res, data)
}
