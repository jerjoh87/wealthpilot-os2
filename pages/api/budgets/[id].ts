import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const BudgetUpdateSchema = z.object({
  limit: z.number(),
})

type BudgetUpdatePayload = {
  limit: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return err(res, 'Invalid budget ID', 400)
  }

  const db = supabaseAdmin() as any
  if (req.method === 'PUT') {
    const parsed = BudgetUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return err(res, parsed.error.errors[0].message)
    }

    const payload: BudgetUpdatePayload = {
      limit: Number(parsed.data.limit ?? 0),
    }

    const { data, error } = await db
      .from('budgets')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      return err(res, error.message)
    }

    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    const { error } = await db
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return err(res, error.message)
    return ok(res, { id })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
