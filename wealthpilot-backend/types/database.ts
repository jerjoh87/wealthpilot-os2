// Generated types matching Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_ID > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row:    { id: string; email: string; name: string; plan: string; created_at: string }
        Insert: { id?: string; email: string; name: string; plan?: string }
        Update: { name?: string; plan?: string }
      }
      accounts: {
        Row:    { id: string; user_id: string; plaid_item_id: string | null; name: string; type: string; balance: number; institution: string; last4: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      budgets: {
        Row:    { id: string; user_id: string; category: string; limit: number; month: number; year: number }
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id'>
        Update: Partial<Pick<Database['public']['Tables']['budgets']['Row'], 'limit'>>
      }
      transactions: {
        Row:    { id: string; user_id: string; account_id: string | null; name: string; amount: number; category: string; date: string; plaid_tx_id: string | null }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id'>
        Update: Pick<Database['public']['Tables']['transactions']['Row'], 'category'>
      }
      bills: {
        Row:    { id: string; user_id: string; name: string; amount: number; due_day: number; category: string; autopay: boolean; recurring: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['bills']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bills']['Insert']>
      }
      calendar_events: {
        Row:    { id: string; user_id: string; title: string; amount: number; type: string; due_date: string; status: string; autopay: boolean; recurring: string; notes: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>
      }
      credit_scores: {
        Row:    { id: string; user_id: string; score: number; provider: string; recorded_at: string }
        Insert: Omit<Database['public']['Tables']['credit_scores']['Row'], 'id'>
        Update: never
      }
      portfolio: {
        Row:    { id: string; user_id: string; ticker: string; name: string; shares: number; price: number; value: number; change_pct: number; source: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['portfolio']['Row'], 'id' | 'updated_at'>
        Update: Partial<Pick<Database['public']['Tables']['portfolio']['Row'], 'shares' | 'price' | 'value' | 'change_pct'>>
      }
      ai_messages: {
        Row:    { id: string; user_id: string; role: 'user' | 'assistant'; content: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['ai_messages']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

// Convenience row types
export type UserRow           = Database['public']['Tables']['users']['Row']
export type BudgetRow         = Database['public']['Tables']['budgets']['Row']
export type BillRow           = Database['public']['Tables']['bills']['Row']
export type CalendarEventRow  = Database['public']['Tables']['calendar_events']['Row']
export type TransactionRow    = Database['public']['Tables']['transactions']['Row']
export type PortfolioRow      = Database['public']['Tables']['portfolio']['Row']
export type CreditScoreRow    = Database['public']['Tables']['credit_scores']['Row']
export type AiMessageRow      = Database['public']['Tables']['ai_messages']['Row']
