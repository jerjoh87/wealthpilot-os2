import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { BillSchema } from '../../../lib/schemas'

// PUT    /api/bills/:id
// DELETE /api/bills/:id
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query
  const db = supabaseAdmin()
  const filter = db.from('bills').eq('id', id as string).eq('user_id', user.id)

  if (req.method === 'PUT') {
    const parsed = BillSchema.partial().safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)
    const { data, error } = await filter.update(parsed.data).select().single()
    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    const { error } = await filter.delete()
    if (error) return err(res, error.message)
    return ok(res, { deleted: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
