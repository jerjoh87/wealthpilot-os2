import type { NextApiRequest, NextApiResponse } from 'next'
import { err, methodNotAllowed, ok, requireUser } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'

const asNumber = (value: unknown, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const user = await requireUser(req, res)
  if (!user) return

  const scanData = req.body?.scanData
  if (!scanData || typeof scanData !== 'object') return err(res, 'Invalid scan payload.', 400)

  let db: any
  try {
    db = supabaseAdmin() as any
  } catch {
    return err(res, 'Database is not configured yet.', 503)
  }

  const consumer = scanData.consumer || {}
  const scores = scanData.scores || {}
  const summary = scanData.summary || {}
  const fundingReadiness = scanData.fundingReadiness || {}

  const { data: report, error } = await db.from('credit_reports').insert({
    user_id: user.id,
    credit_score: asNumber(scores.ficoScore ?? scores.vantageScore, 0),
    report_date: consumer.reportDate || null,
    bureaus: consumer.bureau ? [String(consumer.bureau)] : [],
    total_open_accounts: asNumber(summary.openAccounts, 0),
    total_closed_accounts: asNumber(summary.closedAccounts, 0),
    total_debt: asNumber(summary.totalDebt, 0),
    revolving_utilization: asNumber(summary.creditUtilization, 0),
    hard_inquiries: asNumber(summary.inquiryCount, 0),
    collections: Array.isArray(scanData.collections) ? scanData.collections.length : 0,
    negative_items: asNumber(summary.derogatoryCount, 0),
    funding_readiness_score: asNumber(fundingReadiness.score, 0),
    raw_ai_json: scanData,
  }).select('id').single()

  if (error) return err(res, error.message, 500)

  const accounts = Array.isArray(scanData.accounts) ? scanData.accounts : []
  if (accounts.length) {
    const { error: accountError } = await db.from('credit_report_accounts').insert(accounts.map((a: any) => ({
      report_id: report.id,
      user_id: user.id,
      account_name: a.creditorName || 'Account',
      account_type: a.accountType || null,
      account_status: a.accountStatus || null,
      bureau: a.bureau || null,
      balance: asNumber(a.balance, 0),
      credit_limit: asNumber(a.creditLimit, 0),
      monthly_payment: asNumber(a.monthlyPayment, 0),
      date_opened: a.dateOpened || null,
      last_reported: a.lastReported || null,
      payment_status: a.paymentStatus || null,
      is_negative: Boolean(a.isNegative),
      dispute_reason: a.disputeReason || null,
      confidence: asNumber(a.confidence, 0),
    })))
    if (accountError) return err(res, accountError.message, 500)
  }

  return ok(res, { reportId: report.id })
}
