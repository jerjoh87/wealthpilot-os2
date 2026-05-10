import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const CalendarEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  date: z.string().optional(),
  event_type: z.string().optional(),
  paid: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return err(res, 'Invalid calendar event ID', 400)
  }

  const db = supabaseAdmin()

  if (req.method === 'PUT') {
    const parsed = CalendarEventSchema.partial().safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const { data, error } = await db
      .from('calendar_events')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) return err(res, error.message)

    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    const { error } = await db
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return err(res, error.message)

    return ok(res, { deleted: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
