// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { BudgetSchema } from '../../../lib/schemas'

// GET  /api/budgets?month=5&year=2026
// POST /api/budgets
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { month, year } = req.query
    let query = db.from('budgets').select('*').eq('user_id', user.id)
    if (month) query = query.eq('month', Number(month))
    if (year)  query = query.eq('year',  Number(year))
    const { data, error } = await query
    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'POST') {
    const parsed = BudgetSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)
    const { data, error } = await db.from('budgets').insert({ ...parsed.data, user_id: user.id }).select().single()
    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
