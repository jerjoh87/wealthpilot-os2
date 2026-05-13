import type { NextApiRequest } from 'next'
import { supabaseAdmin } from './supabase'

export const twilioConfigured = () => Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) return { sent: false, reason: 'missing_twilio' }

  const payload = new URLSearchParams({ To: to, From: from, Body: body })
  const auth = Buffer.from(`${sid}:${token}`).toString('base64')
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Twilio error: ${text}`)
  }
  return { sent: true }
}

export function buildBudgetReminderMessage(category: string, dailyLimit: number, weeklyLimit: number, spent: number) {
  const remaining = Math.max(0, weeklyLimit - spent)
  return `${category}: Daily ${dailyLimit.toFixed(2)} | Weekly ${weeklyLimit.toFixed(2)} | Spent ${spent.toFixed(2)} | Remaining ${remaining.toFixed(2)}`
}

export async function sendBudgetSummaryForUser(userId: string) {
  const db = supabaseAdmin() as any
  const { data: pref } = await db.from('reminder_preferences').select('*').eq('user_id', userId).single()
  if (!pref) return { sent: false, reason: 'no_preferences', fallback: true }

  const categories = Array.isArray(pref.categories) ? pref.categories.slice(0, 4) : []
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const { data: budgets } = await db.from('budgets').select('category, limit, spent').eq('user_id', userId).eq('month', month).eq('year', year)
  const selected = (budgets || []).filter((b: any) => categories.includes(b.category))

  const lines = selected.map((b: any) => buildBudgetReminderMessage(b.category, Number(b.limit || 0) / 30, Number(b.limit || 0), Number(b.spent || 0)))
  const message = lines.length ? `Budget Reminder\n${lines.join('\n')}` : 'Budget Reminder: No selected category budgets found yet.'

  if (!twilioConfigured()) {
    await db.from('in_app_reminders').insert({ user_id: userId, title: 'Budget reminder', message, channel: 'in_app' })
    return { sent: false, fallback: true, reason: 'missing_twilio', message }
  }

  await sendSms(pref.phone_number, message)
  return { sent: true, fallback: false }
}

export async function getUserFromBody(req: NextApiRequest) {
  return typeof req.body?.userId === 'string' ? req.body.userId : null
}
