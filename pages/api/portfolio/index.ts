import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

const HoldingSchema = z.object({
  ticker:     z.string().min(1).max(10).toUpperCase(),
  name:       z.string().default(''),
  shares:     z.number().positive(),
  price:      z.number().positive(),
  value:      z.number().positive(),
  change_pct: z.number().default(0),
  source:     z.enum(['manual', 'snaptrade', 'webull']).default('manual'),
})

// Compute summary from holdings array
function buildSummary(holdings: any[]) {
  const totalValue    = holdings.reduce((s, h) => s + h.value, 0)
  const totalCost     = holdings.reduce((s, h) => s + h.shares * h.price, 0)
  const dayChangePct  = holdings.length
    ? holdings.reduce((s, h) => s + h.change_pct * (h.value / totalValue), 0)
    : 0
  return { totalValue, totalCost, dayChangePct: parseFloat(dayChangePct.toFixed(2)) }
}

// GET    /api/portfolio           — all holdings + summary
// POST   /api/portfolio           — add manual holding
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('portfolio')
      .select('*')
      .eq('user_id', user.id)
      .order('value', { ascending: false })

    if (error) return err(res, error.message)

    return ok(res, {
      holdings: data ?? [],
      summary:  buildSummary(data ?? []),
      connected: (data ?? []).some(h => h.source !== 'manual'),
    })
  }

  if (req.method === 'POST') {
    const parsed = HoldingSchema.safeParse(req.body)
    if (!parsed.success) return err(res, parsed.error.errors[0].message)

    // Upsert by ticker — one row per ticker per user
    const { data, error } = await db
      .from('portfolio')
      .upsert(
        { ...parsed.data, user_id: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,ticker' }
      )
      .select()
      .single()

    if (error) return err(res, error.message)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
