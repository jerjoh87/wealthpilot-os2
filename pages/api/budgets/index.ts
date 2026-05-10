import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const BudgetSchema = z.object({
  category: z.string().min(1),
  limit: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
})

type BudgetInsertPayload = {
  user_id: string
  category: string
  limit: number
  month: number
  year: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin() as any

  if (req.method === 'GET') {
    const now = new Date()
    const month =
      typeof req.query.month === 'string'
        ? Number(req.query.month)
        : now.getMonth() + 1

    const year =
      typeof req.query.year === 'string'
        ? Number(req.query.year)
        : now.getFullYear()

    const { data, error } = await db
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .order('category', { ascending: true })

    if (error) return err(res, error.message)

    return ok(res, data ?? [])
  }

  if (req.method === 'POST') {
    const parsed = BudgetSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const payload: BudgetInsertPayload = {
      user_id: user.id,
      category: parsed.data.category,
      limit: Number(parsed.data.limit ?? 0),
      month: parsed.data.month,
      year: parsed.data.year,
    }

    const { data, error } = await db
      .from('budgets')
      .insert(payload)
      .select('*')
      .single()

    if (error) return err(res, error.message)

    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
