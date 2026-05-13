import type { NextApiRequest, NextApiResponse } from 'next'

const PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const plan = String(req.body?.plan || '').toLowerCase()
  if (!['pro', 'premium'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' })

  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY)
  const priceId = PRICE_MAP[plan]
  if (!hasStripe || !priceId) return res.status(200).json({ message: 'Billing setup required.' })

  // Stripe checkout wiring intentionally blocked until billing backend is finalized.
  return res.status(200).json({ message: 'Billing setup required.' })
}
