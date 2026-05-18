import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed, ensureSupabaseConfigured } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const BillSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  due_day: z.number().int().min(1).max(31),
  autopay: z.boolean().optional().default(false),
})

type BillInsert = {
  user_id: string
  name: string
  amount: number
  due_day: number
  autopay: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ensureSupabaseConfigured(res)) return
  const user = await requireUser(req, res)
  if (!user) return

  let db: any
  try {
    db = supabaseAdmin() as any
  } catch {
    return err(res, 'Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY.', 503)
  }

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_day', { ascending: true })

    if (error) return err(res, error.message)

    return ok(res, data ?? [])
  }

  if (req.method === 'POST') {
    const parsed = BillSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const payload: BillInsert = {
      user_id: user.id,
      name: parsed.data.name,
      amount: Number(parsed.data.amount ?? 0),
      due_day: parsed.data.due_day,
      autopay: parsed.data.autopay ?? false,
    }

    const { data, error } = await db
      .from('bills')
      .insert(payload)
      .select('*')
      .single()

    if (error) return err(res, error.message)

    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
