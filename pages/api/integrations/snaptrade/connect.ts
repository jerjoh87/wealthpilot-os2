import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const configured = Boolean(process.env.SNAPTRADE_CLIENT_ID && process.env.SNAPTRADE_CONSUMER_KEY)
  if (!configured) {
    return res.status(200).json({ ok: false, configured: false, message: 'SnapTrade is not configured yet. Set SNAPTRADE_CLIENT_ID and SNAPTRADE_CONSUMER_KEY.' })
  }

  return res.status(200).json({ ok: true, configured: true, message: 'SnapTrade is configured. Connection handshake endpoint is ready.' })
}
