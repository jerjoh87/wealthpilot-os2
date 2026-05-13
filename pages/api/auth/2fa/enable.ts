import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { ok, err, methodNotAllowed } from '../../../../lib/api'
import { enableTwoFactor } from '../../../../lib/two-factor'

const Schema = z.object({ email: z.string().email() })

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const state = enableTwoFactor(parsed.data.email)
  return ok(res, { enabled: Boolean(state?.enabled), method: 'email', authenticatorAppAvailable: false })
}
