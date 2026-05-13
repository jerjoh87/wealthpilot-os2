import type { NextApiRequest, NextApiResponse } from 'next'

const VALID_STATUSES = new Set(['free', 'pro', 'premium', 'canceled', 'past_due'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const userPlan = String(req.headers['x-user-plan'] || req.query.plan || 'free').toLowerCase()
  const status = VALID_STATUSES.has(userPlan) ? userPlan : 'free'
  return res.status(200).json({ status })
}
