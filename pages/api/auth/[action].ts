import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { ok, err, methodNotAllowed, getUser } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { SignupSchema, LoginSchema } from '../../../lib/schemas'

// POST /api/auth/signup
export async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const parsed = SignupSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { email, password, name } = parsed.data

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error) return err(res, error.message)

  return ok(res, { user: data.user, session: data.session }, 201)
}

// POST /api/auth/login
export async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { email, password } = parsed.data

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return err(res, error.message, 401)

  return ok(res, { user: data.user, session: data.session })
}

// POST /api/auth/logout
export async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const token = req.headers.authorization?.replace('Bearer ', '').trim()
  if (token) {
    const user = await getUser(req)
    if (!user) return err(res, 'Unauthorized', 401)

    const { error } = await supabaseAdmin().auth.admin.signOut(token)
    if (error) return err(res, error.message)
  }

  return ok(res, { success: true })
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query
  if (action === 'signup') return signup(req, res)
  if (action === 'login')  return login(req, res)
  if (action === 'logout') return logout(req, res)
  return err(res, 'Not found', 404)
}
