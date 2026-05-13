import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const CreditScoreSchema = z.object({
  score:    z.number().int().min(300).max(850),
  provider: z.enum(['manual', 'experian', 'equifax', 'transunion']).default('manual'),
})


function getCreditScoreInsights(score: number) {
  const band = score >= 800
    ? 'Excellent'
    : score >= 740
      ? 'Very Good'
      : score >= 670
        ? 'Good'
        : score >= 580
          ? 'Fair'
          : 'Needs Work'

  const tipsByBand: Record<string, string[]> = {
    Excellent: [
      'Keep paying every bill on time to protect your strong history.',
      'Keep revolving utilization low (ideally under 10%).',
      'Only apply for new credit when truly needed to limit hard inquiries.',
    ],
    'Very Good': [
      'Pay all accounts on time and set reminders or autopay for due dates.',
      'Lower credit card balances to reduce utilization, ideally under 30%.',
      'Avoid opening multiple new accounts in a short period.',
    ],
    Good: [
      'Focus on on-time payments every month to build score momentum.',
      'Pay down higher-balance cards first to improve utilization.',
      'Check your report for errors and dispute inaccuracies promptly.',
    ],
    Fair: [
      'Bring any past-due accounts current as soon as possible.',
      'Keep card balances down and avoid maxing out revolving lines.',
      'Use a simple monthly budget to avoid missed payments.',
    ],
    'Needs Work': [
      'Prioritize current payments and contact lenders if you need hardship options.',
      'Start reducing high-utilization balances, even with small extra payments.',
      'Review your credit report to identify and address negative items.',
    ],
  }

  return {
    band,
    tips: tipsByBand[band].slice(0, 3),
    notice: 'These are educational insights, not legal or credit-repair guarantees.',
  }
}

// GET  /api/credit-score          — latest score + history (last 12 entries)
// POST /api/credit-score          — record new score (manual or provider sync)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('credit_scores')
      .select('id, score, provider, recorded_at')
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

    const insights = latest ? getCreditScoreInsights(latest.score) : null

    return ok(res, { latest, history, trend, insights })
  }

  if (req.method === 'POST') {
    const parsed = CreditScoreSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    const { data, error } = await db
      .from('credit_scores')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
