import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

type UserSummary = {
  name: string | null
  plan: string | null
}

type TransactionSummary = {
  amount: number
  category: string | null
}

type BillSummary = {
  name: string | null
  amount: number
  due_day: number | null
  autopay: boolean | null
}

type BudgetSummary = {
  category: string | null
  limit: number
}

type AiMessageInsert = {
  user_id: string
  role: 'user' | 'assistant'
  content: string
}

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),

  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
  context: z
    .object({
      incomeTotal: z.number().optional(),
      budgetSummary: z.array(z.object({ category: z.string(), limit: z.number(), spent: z.number().optional() })).optional(),
      billsSummary: z.array(z.object({ name: z.string(), amount: z.number(), dueDay: z.number().nullable().optional(), paid: z.boolean().optional() })).optional(),
      accountsSummary: z.array(z.object({ name: z.string(), type: z.string().optional(), balance: z.number() })).optional(),
      goalsSummary: z.array(z.object({ name: z.string(), target: z.number().optional(), current: z.number().optional() })).optional(),
      creditScore: z.number().optional(),
      debtSummary: z.object({ totalDebt: z.number().optional() }).optional(),
    })
    .optional(),
})

// Builds a finance-aware system prompt from the user's live DB data
async function buildSystemPrompt(userId: string): Promise<string> {
  const db = supabaseAdmin() as any
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const [userResult, budgetsResult, billsResult, txSummaryResult] = await Promise.all([
    db.from('users').select('name, plan').eq('id', userId).single(),

    db
      .from('budgets')
      .select('category, limit')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year),

    db
      .from('bills')
      .select('name, amount, due_day, autopay')
      .eq('user_id', userId),

    db
      .from('transactions')
      .select('amount, category')
      .eq('user_id', userId)
      .gte('date', monthStart),
  ])

  const userData = userResult?.data as UserSummary | null
  const budgetsData = budgetsResult?.data as unknown[] | null
  const billsData = billsResult?.data as unknown[] | null
  const txSummaryData = txSummaryResult?.data as unknown[] | null

  const txSummary: TransactionSummary[] = Array.isArray(txSummaryData)
    ? txSummaryData.map((item) => {
        const t = item as Partial<TransactionSummary>

        return {
          amount: Number(t.amount ?? 0),
          category: t.category ?? null,
        }
      })
    : []

  const bills: BillSummary[] = Array.isArray(billsData)
    ? billsData.map((item) => {
        const b = item as Partial<BillSummary>

        return {
          name: b.name ?? null,
          amount: Number(b.amount ?? 0),
          due_day: typeof b.due_day === 'number' ? b.due_day : null,
          autopay: typeof b.autopay === 'boolean' ? b.autopay : null,
        }
      })
    : []

  const budgets: BudgetSummary[] = Array.isArray(budgetsData)
    ? budgetsData.map((item) => {
        const b = item as Partial<BudgetSummary>

        return {
          category: b.category ?? null,
          limit: Number(b.limit ?? 0),
        }
      })
    : []

  const totalSpend = txSummary
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const totalIncome = txSummary
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0)

  const upcomingBillsTotal = bills.reduce((s, b) => s + b.amount, 0)

  const budgetText =
    budgets
      .map((b) => `${b.category ?? 'Uncategorized'} ($${b.limit.toFixed(2)} limit)`)
      .join(', ') || 'none set'

  return `You are WealthPilot AI, a personal finance coach for ${userData?.name ?? 'the user'}.
Current month: ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}.
Monthly income tracked: $${totalIncome.toFixed(2)}.
Monthly spending tracked: $${totalSpend.toFixed(2)}.
Upcoming bills total: $${upcomingBillsTotal.toFixed(2)} across ${bills.length} bills.
Budget categories this month: ${budgetText}.
Be concise, specific, and reference actual numbers. Never make up data not provided above.`
}


const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_MESSAGES = 20
const aiRateLimitByUser = new Map<string, number[]>()

function isRateLimited(userId: string) {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const entries = (aiRateLimitByUser.get(userId) ?? []).filter((t) => t > cutoff)

  if (entries.length >= RATE_LIMIT_MAX_MESSAGES) {
    aiRateLimitByUser.set(userId, entries)
    return true
  }

  entries.push(now)
  aiRateLimitByUser.set(userId, entries)
  return false
}

function buildOfflineReply(message: string, context?: any) {
  const m = message.toLowerCase()
  const nextBill = (context?.billsSummary || [])
    .filter((b: any) => !b.paid)
    .sort((a: any, b: any) => (a.dueDay ?? 99) - (b.dueDay ?? 99))[0]
  const income = Number(context?.incomeTotal || 0)
  const totalBudgetLeft = (context?.budgetSummary || []).reduce((sum: number, b: any) => {
    const left = Number(b.limit || 0) - Number(b.spent || 0)
    return sum + Math.max(0, left)
  }, 0)
  if (m.includes('bill') && nextBill) {
    return `Your next unpaid bill is ${nextBill.name} for $${Number(nextBill.amount).toFixed(2)} due on day ${nextBill.dueDay ?? 'N/A'}. Suggested action: set a reminder 2 days early and confirm autopay status today.`
  }
  if (m.includes('credit')) return 'To improve credit this month: keep card utilization below 30%, pay on-time, and avoid new hard inquiries. Suggested action: pay down your highest-utilization card first, then set autopay for minimum due.'
  if (m.includes('save') || m.includes('savings')) return `A practical weekly savings move: cap discretionary spending and auto-transfer a small fixed amount right after income lands. You currently have about $${totalBudgetLeft.toFixed(2)} of unspent budget room this month to protect.`
  if (m.includes('afford')) return `Use this quick rule: (income - fixed bills - minimum debt payments) should stay positive with a buffer. Current tracked income is $${income.toFixed(2)}. Suggested action: check this purchase against your category's remaining budget before buying.`
  if (m.includes('debt')) return 'Debt payoff plan: pay minimums on all debts, direct extra cash to the highest-interest debt, and repeat monthly. Suggested action: choose one target debt and commit a fixed extra amount this week.'
  if (m.includes('goal')) return 'For savings goals, set a target date and divide remaining amount by months left to get a required monthly contribution. Suggested action: create one goal and automate the transfer.'
  if (m.includes('budget') || m.includes('spend')) return `Budget check: prioritize must-pay bills, then protect essentials, then discretionary categories. Suggested action: freeze one category this week to stay under limit. Current unspent budget total is about $${totalBudgetLeft.toFixed(2)}.`
  return 'Here’s a useful next step today: review your next bill due date, verify one spending category is under its limit, and schedule a small automatic savings transfer. I can help you break this into a 7-day plan if you want.'
}
// POST /api/ai/chat
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  if (isRateLimited(user.id)) return err(res, 'Rate limit exceeded: max 20 messages per minute', 429)

  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { message, history } = parsed.data
  const db = supabaseAdmin() as any

  const userMessage: AiMessageInsert = {
    user_id: user.id,
    role: 'user',
    content: message,
  }

  // 1. Persist user message
  await db.from('ai_messages').insert(userMessage)

  // 2. Build context-aware system prompt from live DB
  const systemPrompt = await buildSystemPrompt(user.id)

  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY)
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
  let reply = ''
  let mode: 'online' | 'offline' | 'error_fallback' = 'offline'

  try {
    if (hasAnthropic) {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY as string,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [...history, { role: 'user', content: message }],
        }),
      })
      if (!anthropicRes.ok) throw new Error('Anthropic request failed')
      const aiData = await anthropicRes.json()
      reply = aiData.content?.[0]?.text ?? ''
      mode = 'online'
    } else if (hasOpenAI) {
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message },
          ],
          temperature: 0.3,
        }),
      })
      if (!openAiRes.ok) throw new Error('OpenAI request failed')
      const aiData = await openAiRes.json()
      reply = aiData.choices?.[0]?.message?.content ?? ''
      mode = 'online'
    }
  } catch (_) {
    reply = ''
    mode = 'error_fallback'
  }

  if (!reply) {
    reply = buildOfflineReply(message, parsed.data.context)
    if (mode !== 'error_fallback') mode = 'offline'
  }

  const assistantMessage: AiMessageInsert = {
    user_id: user.id,
    role: 'assistant',
    content: reply,
  }

  // 5. Persist assistant reply
  await db.from('ai_messages').insert(assistantMessage)

  return ok(res, { reply, mode })
}
