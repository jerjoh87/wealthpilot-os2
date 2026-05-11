import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { ok, err, methodNotAllowed } from '../../../lib/api'
import { LoginSchema } from '../../../lib/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { email, password } = parsed.data
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return err(res, error.message, 401)
  return ok(res, { user: data.user, session: data.session })
}
