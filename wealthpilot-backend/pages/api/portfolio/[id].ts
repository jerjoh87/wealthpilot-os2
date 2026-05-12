// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const UpdateSchema = z.object({
  shares:     z.number().positive().optional(),
  price:      z.number().positive().optional(),
  value:      z.number().positive().optional(),
  change_pct: z.number().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'No fields to update' })

// PUT    /api/portfolio/:id   — update price/shares/value (manual refresh)
// DELETE /api/portfolio/:id   — remove holding (manual only; SnapTrade will re-sync)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query
  const db = supabaseAdmin()

  if (req.method === 'PUT') {
    const parsed = UpdateSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const { data, error } = await db
      .from('portfolio')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id as string)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    const { error } = await db
      .from('portfolio')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id)

    if (error) return err(res, error.message)
    return ok(res, { deleted: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
