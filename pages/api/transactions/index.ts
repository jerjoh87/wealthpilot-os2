import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed, ensureSupabaseConfigured } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const TransactionSchema = z.object({
  account_id: z.string().uuid().nullable().default(null),
  name:       z.string().min(1),
  amount:     z.number(),
  category:   z.string().default('Uncategorized'),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// GET  /api/transactions?month=5&year=2026&category=Dining&limit=50&offset=0
// POST /api/transactions  (manual entry; Plaid will upsert via plaid_tx_id later)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ensureSupabaseConfigured(res)) return
  const user = await requireUser(req, res)
  if (!user) return

  let db: any
  try {
    db = supabaseAdmin()
  } catch {
    return err(res, 'Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY.', 503)
  }

  if (req.method === 'GET') {
    const { month, year, category, limit = '50', offset = '0' } = req.query

    let query = db
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (month && year) {
      const m = String(month).padStart(2, '0')
      const y = String(year)
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      query = query.gte('date', `${y}-${m}-01`).lte('date', `${y}-${m}-${lastDay}`)
    }

    if (category && category !== 'All') {
      query = query.eq('category', category as string)
    }

    const { data, error, count } = await query
    if (error) return err(res, error.message)
    return ok(res, { transactions: data, total: count })
  }

  if (req.method === 'POST') {
    const parsed = TransactionSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)
    const { data, error } = await db
      .from('transactions')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()
    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
