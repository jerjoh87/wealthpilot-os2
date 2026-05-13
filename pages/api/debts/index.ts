import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (error) return err(res, error.message, 500)
    return ok(res, data ?? [])
  }

  if (req.method === 'POST') {
    const payload = { ...(req.body || {}), user_id: user.id }
    const { data, error } = await supabase.from('debts').insert(payload).select('*').single()
    if (error) return err(res, error.message, 500)
    return ok(res, data, 201)
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
