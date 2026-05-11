import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { ok, err, methodNotAllowed } from '../../../lib/api'
import { SignupSchema } from '../../../lib/schemas'

function getSiteUrl(req: NextApiRequest) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'http'
  const rawHost = Array.isArray(host) ? host[0] : host
  if (!rawHost) return undefined
  return `${protocol}://${rawHost}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const parsed = SignupSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { email, password, name } = parsed.data
  const siteUrl = getSiteUrl(req)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      ...(siteUrl ? { emailRedirectTo: siteUrl } : {}),
    },
  })

  if (error) return err(res, error.message)
  return ok(res, { user: data.user, session: data.session }, 201)
}
