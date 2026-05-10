import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const BudgetSchema = z.object({
  category: z.string().min(1),
  limit: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
})

export const BillSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  due_day: z.number().int().min(1).max(31),
  category: z.string(),
  autopay: z.boolean().default(false),
  recurring: z.enum(['none','weekly','biweekly','monthly','yearly']).default('monthly'),
})

export const CalendarEventSchema = z.object({
  title: z.string().min(1),
  amount: z.number(),
  type: z.enum(['bill','subscription','income','debt','transfer','savings','reminder']),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['upcoming','paid','overdue']).default('upcoming'),
  autopay: z.boolean().default(false),
  recurring: z.enum(['none','weekly','biweekly','monthly','yearly']).default('none'),
  notes: z.string().default(''),
})

export const CreditScoreSchema = z.object({
  score:    z.number().int().min(300).max(850),
  provider: z.enum(['manual','experian','equifax','transunion']).default('manual'),
})

export const HoldingSchema = z.object({
  ticker:     z.string().min(1).max(10).toUpperCase(),
  name:       z.string().default(''),
  shares:     z.number().positive(),
  price:      z.number().positive(),
  value:      z.number().positive(),
  change_pct: z.number().default(0),
  source:     z.enum(['manual','snaptrade','webull']).default('manual'),
})

export const TransactionSchema = z.object({
  account_id: z.string().uuid().nullable().default(null),
  name:       z.string().min(1),
  amount:     z.number(),
  category:   z.string().default('Uncategorized'),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role:    z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20).default([]),
})

export type SignupInput        = z.infer<typeof SignupSchema>
export type LoginInput         = z.infer<typeof LoginSchema>
export type BudgetInput        = z.infer<typeof BudgetSchema>
export type BillInput          = z.infer<typeof BillSchema>
export type CalendarEventInput = z.infer<typeof CalendarEventSchema>
export type CreditScoreInput   = z.infer<typeof CreditScoreSchema>
export type HoldingInput       = z.infer<typeof HoldingSchema>
export type TransactionInput   = z.infer<typeof TransactionSchema>
export type ChatInput          = z.infer<typeof ChatSchema>
