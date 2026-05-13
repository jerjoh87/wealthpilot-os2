import type { NextApiRequest, NextApiResponse } from 'next'
import { err, methodNotAllowed, ok } from '../../../lib/api'
import { sendBudgetSummaryForUser } from '../../../lib/reminders'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const userId = typeof req.body?.userId === 'string' ? req.body.userId : ''
  if (!userId) return err(res, 'userId is required')

  const result = await sendBudgetSummaryForUser(userId)
  return ok(res, result)
}
