import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const BillSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().optional(),
  due_day: z.number().int().min(1).max(31).optional(),
  autopay: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query
  const db = supabaseAdmin() as any

  if (!id || Array.isArray(id)) {
    return err(res, 'Invalid bill ID', 400)
  }

  if (req.method === 'PUT') {
    const parsed = BillSchema.partial().safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const { data, error } = await db
      .from('bills')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) return err(res, error.message, 500)

    return ok(res, { bill: data })
  }

  if (req.method === 'DELETE') {
    const { error } = await db
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return err(res, error.message, 500)

    return ok(res, { deleted: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
