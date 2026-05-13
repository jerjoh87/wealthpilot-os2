import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { ok, err, methodNotAllowed } from '../../../../lib/api'
import { generateTwoFactorCode, isTwoFactorEnabled, sendTwoFactorCode } from '../../../../lib/two-factor'

const Schema = z.object({ email: z.string().email() })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { email } = parsed.data
  if (!isTwoFactorEnabled(email)) return err(res, 'Two-factor authentication is not enabled for this account.', 400)

  const code = generateTwoFactorCode(email)
  await sendTwoFactorCode(email, code)

  return ok(res, { sent: true, method: 'email' })
}
