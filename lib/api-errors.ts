import type { NextApiResponse } from 'next'

export const sendNotConfigured = (res: NextApiResponse, message = 'This feature is not configured yet.') =>
  res.status(503).json({ data: null, error: message })

export const sendBadRequest = (res: NextApiResponse, message = 'Invalid request.') =>
  res.status(400).json({ data: null, error: message })

export const sendServerError = (res: NextApiResponse, message = 'Something went wrong.') =>
  res.status(500).json({ data: null, error: message })
