// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { CalendarEventSchema } from '../../../lib/schemas'

// GET  /api/calendar-events?month=5&year=2026
// POST /api/calendar-events
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { month, year } = req.query
    let query = db.from('calendar_events').select('*').eq('user_id', user.id).order('due_date')

    // Filter by month/year if provided (e.g. due_date between 2026-05-01 and 2026-05-31)
    if (month && year) {
      const m  = String(month).padStart(2, '0')
      const y  = String(year)
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      query = query.gte('due_date', `${y}-${m}-01`).lte('due_date', `${y}-${m}-${lastDay}`)
    }

    const { data, error } = await query
    if (error) return err(res, error.message)
    return ok(res, data)
  }

  if (req.method === 'POST') {
    const parsed = CalendarEventSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)
    const { data, error } = await db.from('calendar_events').insert({ ...parsed.data, user_id: user.id }).select().single()
    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
