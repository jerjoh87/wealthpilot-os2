import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { ok, err, methodNotAllowed } from '../../../lib/api'
import { z } from 'zod'

const LogoutSchema = z.object({
  refresh_token: z.string().min(1).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const parsed = LogoutSchema.safeParse(req.body ?? {})
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const refreshToken = parsed.data.refresh_token
  if (refreshToken) {
    const { error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (!error) await supabase.auth.signOut()
  }

  return ok(res, { logged_out: true })
}
