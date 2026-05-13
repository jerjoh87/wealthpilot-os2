import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return

  const id = req.query.id
  if (!id || Array.isArray(id)) return err(res, 'Invalid id', 400)

  if (req.method === 'PUT') {
    const { data, error } = await supabase
      .from('debts')
      .update(req.body || {})
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()
    if (error) return err(res, error.message, 500)
    return ok(res, data)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('debts').delete().eq('id', id).eq('user_id', user.id)
    if (error) return err(res, error.message, 500)
    return ok(res, { success: true })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
}
