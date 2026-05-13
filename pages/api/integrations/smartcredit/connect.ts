import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const configured = Boolean(process.env.SMARTCREDIT_API_KEY || process.env.SMARTCREDIT_CONNECT_URL)
  if (!configured) {
    return res.status(200).json({ ok: false, configured: false, message: 'SmartCredit is not configured yet. Set SMARTCREDIT_API_KEY or SMARTCREDIT_CONNECT_URL.' })
  }

  return res.status(200).json({ ok: true, configured: true, message: 'SmartCredit is configured. Connection handshake endpoint is ready.' })
}
