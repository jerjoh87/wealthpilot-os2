import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const CreditScoreSchema = z.object({
  score: z.number().int().min(300).max(850),
  bureau: z.enum(['Experian', 'Equifax', 'TransUnion', 'Other']).default('Other'),
  date: z.string().date().optional(),
  notes: z.string().max(1000).optional(),
})

// GET  /api/credit-score          — latest score + history (last 12 entries)
// POST /api/credit-score          — record new score (manual or provider sync)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('credit_scores')
      .select('id, score, provider, recorded_at, bureau, notes, score_date')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(12)

    if (error) return err(res, error.message)

    const latest  = data?.[0] ?? null
    const history = data ?? []

    // Simple trend: compare latest vs previous
    const trend = history.length >= 2
      ? history[0].score - history[1].score
      : 0

    return ok(res, { latest, history, trend })
  }

  if (req.method === 'POST') {
    const parsed = CreditScoreSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const payload = parsed.data
    const provider = payload.bureau.toLowerCase() === 'transunion' ? 'transunion' : payload.bureau.toLowerCase() === 'equifax' ? 'equifax' : payload.bureau.toLowerCase() === 'experian' ? 'experian' : 'manual'

    const { data, error } = await db
      .from('credit_scores')
      .insert({
        user_id: user.id,
        score: payload.score,
        provider,
        bureau: payload.bureau,
        notes: payload.notes || null,
        score_date: payload.date || null,
      })
      .select()
      .single()

    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
