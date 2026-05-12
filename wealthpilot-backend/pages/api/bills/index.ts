// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { BillSchema } from '../../../lib/schemas'

// GET  /api/bills
// POST /api/bills
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db.from('bills').select('*').eq('user_id', user.id).order('due_day')
    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'POST') {
    const parsed = BillSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)
    const { data, error } = await db.from('bills').insert({ ...parsed.data, user_id: user.id }).select().single()
    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
