import type { NextApiRequest, NextApiResponse } from 'next'
import { ok, err, requireUser, methodNotAllowed } from '../../../lib/api'
import { supabaseAdmin } from '../../../lib/supabase'
import { z } from 'zod'

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

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),

  // Client can pass last N messages to maintain context without fetching from DB
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
})

// Builds a finance-aware system prompt from the user's live DB data
async function buildSystemPrompt(userId: string): Promise<string> {
  const db = supabaseAdmin()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const [{ data: user }, { data: budgetsData }, { data: billsData }, { data: txSummaryData }] =
    await Promise.all([
      db.from('users').select('name, plan').eq('id', userId).single(),

      db
        .from('budgets')
        .select('category, limit')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year),

      db.from('bills').select('name, amount, due_day, autopay').eq('user_id', userId),

      db
        .from('transactions')
        .select('amount, category')
        .eq('user_id', userId)
        .gte('date', monthStart),
    ])

  const txSummary: TransactionSummary[] = Array.isArray(txSummaryData)
    ? txSummaryData.map((t: any) => ({
        amount: Number(t.amount ?? 0),
        category: t.category ?? null,
      }))
    : []

  const bills: BillSummary[] = Array.isArray(billsData)
    ? billsData.map((b: any) => ({
        name: b.name ?? null,
        amount: Number(b.amount ?? 0),
        due_day: typeof b.due_day === 'number' ? b.due_day : null,
        autopay: typeof b.autopay === 'boolean' ? b.autopay : null,
      }))
    : []

  const budgets: BudgetSummary[] = Array.isArray(budgetsData)
    ? budgetsData.map((b: any) => ({
        category: b.category ?? null,
        limit: Number(b.limit ?? 0),
      }))
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

  return `You are WealthPilot AI, a personal finance coach for ${user?.name ?? 'the user'}.
Current month: ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}.
Monthly income tracked: $${totalIncome.toFixed(2)}.
Monthly spending tracked: $${totalSpend.toFixed(2)}.
Upcoming bills total: $${upcomingBillsTotal.toFixed(2)} across ${bills.length} bills.
Budget categories this month: ${budgetText}.
Be concise, specific, and reference actual numbers. Never make up data not provided above.`
}

// POST /api/ai/chat
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req, res)
  if (!user) return

  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) return err(res, parsed.error.errors[0].message)

  const { message, history } = parsed.data
  const db = supabaseAdmin()

  // 1. Persist user message
  await db.from('ai_messages').insert({
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // 2. Build context-aware system prompt from live DB
  const systemPrompt = await buildSystemPrompt(user.id)

  // 3. Call Anthropic API. API key stays server-side.
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...history, { role: 'user', content: message }],
    }),
  })

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text()
    return err(res, `AI service error: ${errBody}`, 502)
  }

  const aiData = await anthropicRes.json()
  const reply = aiData.content?.[0]?.text ?? 'No response from AI.'

  // 4. Persist assistant reply
  await db.from('ai_messages').insert({
    user_id: user.id,
    role: 'assistant',
    content: reply,
  })

  return ok(res, { reply })
}
