import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { ok, err, methodNotAllowed } from '../../../../lib/api'
import { verifyTwoFactorCode } from '../../../../lib/two-factor'

const Schema = z.object({ email: z.string().email(), code: z.string().min(6).max(6) })

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const valid = verifyTwoFactorCode(parsed.data.email, parsed.data.code)
  if (!valid) return err(res, 'Invalid or expired verification code.', 401)

  return ok(res, { verified: true })
}
