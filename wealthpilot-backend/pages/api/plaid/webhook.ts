import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

// POST /api/plaid/webhook
// Register this URL in Plaid Dashboard → Webhooks.
// Plaid pushes events here so you don't have to poll.
// No auth header — verified via webhook_verification_key instead (see Plaid docs).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.status(405).end(); return }

  const { webhook_type, webhook_code, item_id, error } = req.body

  // Always ack immediately — process async
  res.status(200).json({ received: true })

  const db = supabaseAdmin()

  try {
    if (webhook_type === 'TRANSACTIONS') {
      if (['SYNC_UPDATES_AVAILABLE', 'DEFAULT_UPDATE', 'INITIAL_UPDATE'].includes(webhook_code)) {
        // Queue a sync for this item — here we just flag it; a cron/queue would call /api/plaid/sync
        await db.from('plaid_items')
          .update({ needs_sync: true })
          .eq('item_id', item_id)
      }
    }

    if (webhook_type === 'ITEM') {
      if (webhook_code === 'ERROR' && error?.error_code === 'ITEM_LOGIN_REQUIRED') {
        await db.from('plaid_items')
          .update({ status: 'requires_reauth' })
          .eq('item_id', item_id)
      }
      if (webhook_code === 'PENDING_EXPIRATION') {
        await db.from('plaid_items')
          .update({ status: 'pending_expiration' })
          .eq('item_id', item_id)
      }
    }
  } catch (e) {
    console.error('[plaid/webhook]', e)
  }
}
