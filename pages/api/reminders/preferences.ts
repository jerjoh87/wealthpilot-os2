import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

const ReminderPreferenceSchema = z.object({
  categories: z.array(z.string().min(1)).max(4),
  frequency: z.enum(['daily', 'weekly', 'both']),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  phoneNumber: z.string().min(7),
  inAppEnabled: z.boolean().default(true),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  const db = supabaseAdmin() as any

  if (req.method === 'GET') {
    const { data, error } = await db.from('reminder_preferences').select('*').eq('user_id', user.id).single()
    if (error && error.code !== 'PGRST116') return err(res, error.message)
    return ok(res, data ?? null)
  }

  if (req.method === 'POST') {
    const parsed = ReminderPreferenceSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const { data, error } = await db
      .from('reminder_preferences')
      .upsert({
        user_id: user.id,
        categories: parsed.data.categories,
        frequency: parsed.data.frequency,
        reminder_time: parsed.data.reminderTime,
        phone_number: parsed.data.phoneNumber,
        in_app_enabled: parsed.data.inAppEnabled,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('*')
      .single()

    if (error) return err(res, error.message)
    return ok(res, data)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
