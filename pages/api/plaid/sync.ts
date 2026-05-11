import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { plaidClient } from '../../../lib/plaid'
import { supabaseAdmin } from '../../../lib/supabase'
import { decryptPlaidToken } from '../../../lib/crypto'

// POST /api/plaid/sync
// Syncs all Plaid items for the user using the /transactions/sync endpoint.
// Handles added/modified/removed transactions. Safe to call repeatedly.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  const db = supabaseAdmin()

  // 1. Get all active Plaid items for this user
  const { data: items, error: itemsErr } = await db
    .from('plaid_items')
    .select('item_id, access_token, cursor')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (itemsErr) return err(res, itemsErr.message)
  if (!items?.length) return ok(res, { synced: 0, message: 'No connected accounts' })

  const results = { accounts: 0, added: 0, modified: 0, removed: 0 }

  for (const item of items) {
    const accessToken = decryptPlaidToken(item.access_token)
    try {
      // 2. Sync transactions (cursor-based, incremental)
      let cursor  = item.cursor ?? undefined
      let hasMore = true
      const added: any[]    = []
      const modified: any[] = []
      const removed: any[]  = []

      while (hasMore) {
        const txRes = await plaidClient.transactionsSync({
          access_token: accessToken,
          ...(cursor ? { cursor } : {}),
        })
        added.push(...txRes.data.added)
        modified.push(...txRes.data.modified)
        removed.push(...txRes.data.removed)
        hasMore = txRes.data.has_more
        cursor  = txRes.data.next_cursor
      }

      // 3. Upsert added transactions
      if (added.length) {
        const accountIds = Array.from(new Set(added.map((t) => t.account_id).filter(Boolean)))
        const { data: accountRows } = await db
          .from('accounts')
          .select('id, plaid_account_id')
          .eq('user_id', user.id)
          .in('plaid_account_id', accountIds)

        const accountMap = new Map((accountRows ?? []).map((a: any) => [a.plaid_account_id, a.id]))

        const rows = added.map(t => ({
          user_id:     user.id,
          account_id:  accountMap.get(t.account_id) ?? null,
          name:        t.name,
          amount:      -t.amount,       // Plaid: positive = debit; we store negative = expense
          category:    t.personal_finance_category?.primary ?? t.category?.[0] ?? 'Uncategorized',
          date:        t.date,
          plaid_tx_id: t.transaction_id,
        }))
        await db.from('transactions').upsert(rows, { onConflict: 'plaid_tx_id', ignoreDuplicates: false })
        results.added += rows.length
      }

      // 4. Update modified transactions
      for (const t of modified) {
        await db.from('transactions')
          .update({
            name:     t.name,
            amount:   -t.amount,
            category: t.personal_finance_category?.primary ?? t.category?.[0] ?? 'Uncategorized',
            date:     t.date,
          })
          .eq('plaid_tx_id', t.transaction_id)
          .eq('user_id', user.id)
        results.modified++
      }

      // 5. Delete removed transactions
      for (const t of removed) {
        await db.from('transactions')
          .delete()
          .eq('plaid_tx_id', t.transaction_id)
          .eq('user_id', user.id)
        results.removed++
      }

      // 6. Refresh account balances
      const accRes = await plaidClient.accountsGet({ access_token: accessToken })
      for (const a of accRes.data.accounts) {
        await db.from('accounts')
          .update({ balance: a.balances.current ?? 0 })
          .eq('user_id', user.id)
          .eq('plaid_account_id', a.account_id)
      }
      results.accounts += accRes.data.accounts.length

      // 7. Save updated cursor
      await db.from('plaid_items')
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq('item_id', item.item_id)

    } catch (e: any) {
      // Mark item as errored but continue syncing other items
      const plaidErr = e?.response?.data?.error_code
      if (plaidErr === 'ITEM_LOGIN_REQUIRED') {
        await db.from('plaid_items').update({ status: 'requires_reauth' }).eq('item_id', item.item_id)
      }
      console.error(`[plaid/sync] item ${item.item_id}:`, plaidErr ?? e.message)
    }
  }

  return ok(res, results)
}
