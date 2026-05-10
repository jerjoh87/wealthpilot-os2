import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

export type ApiResponse<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: string }

export const ok = <T>(res: NextApiResponse, data: T, status = 200) =>
  res.status(status).json({ data, error: null })

export const err = (res: NextApiResponse, message: string, status = 400) =>
  res.status(status).json({ data: null, error: message })

// Extracts user from Bearer token; returns null if invalid
export async function getUser(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// Route guard — call at top of any protected handler
export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUser(req)
  if (!user) { err(res, 'Unauthorized', 401); return null }
  return user
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed)
  return err(res, `Method not allowed`, 405)
}
