import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

// POST /api/portfolio/sync
// Stub — replace body with real SnapTrade SDK calls when credentials are available.
// Pattern: fetch holdings from SnapTrade → upsert all → return updated portfolio.
//
// SnapTrade setup (future):
//   npm install snaptrade-node
//   SNAPTRADE_CLIENT_ID + SNAPTRADE_CONSUMER_KEY in .env
//   const client = new SnapTrade({ clientId, consumerKey })
//   const holdings = await client.holdings.getUserHoldings({ userId, userSecret })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  // ── STUB: replace this block with real SnapTrade/Webull fetch ──────────────
  const snaptradeConfigured =
    !!process.env.SNAPTRADE_CLIENT_ID && !!process.env.SNAPTRADE_CONSUMER_KEY

  if (!snaptradeConfigured) {
    return err(res, 'Portfolio sync not yet configured. Add SNAPTRADE_CLIENT_ID and SNAPTRADE_CONSUMER_KEY to .env', 501)
  }

  // ── When SnapTrade is connected ────────────────────────────────────────────
  // const rawHoldings = await fetchFromSnapTrade(user.id)
  //
  // const rows = rawHoldings.map(h => ({
  //   user_id:    user.id,
  //   ticker:     h.symbol,
  //   name:       h.description,
  //   shares:     h.units,
  //   price:      h.price,
  //   value:      h.marketValue,
  //   change_pct: h.dayChangePercent,
  //   source:     'snaptrade',
  //   updated_at: new Date().toISOString(),
  // }))
  //
  // const { data, error } = await supabaseAdmin()
  //   .from('portfolio')
  //   .upsert(rows, { onConflict: 'user_id,ticker' })
  //   .select()
  //
  // if (error) return err(res, error.message)
  // return ok(res, { synced: data?.length ?? 0, holdings: data })
  // ──────────────────────────────────────────────────────────────────────────

  return ok(res, { synced: 0, message: 'Stub — SnapTrade integration pending' })
}
