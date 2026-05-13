import type { NextApiRequest, NextApiResponse } from 'next'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'
import { sendBudgetSummaryForUser, twilioConfigured } from '../../../lib/reminders'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const result = await sendBudgetSummaryForUser(user.id)
  return ok(res, {
    ...result,
    notice: twilioConfigured() ? null : 'SMS reminders require Twilio setup. In-app reminders are active.',
  })
}
