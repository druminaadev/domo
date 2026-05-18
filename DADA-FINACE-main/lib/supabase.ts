import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: 'income' | 'expense'
          icon: string | null
          color: string
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          color?: string
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          category_id: string | null
          date: string
          description: string | null
          notes: string | null
          from_account: string | null
          to_account: string | null
          tags: string[] | null
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          category_id?: string | null
          date?: string
          description?: string | null
          notes?: string | null
          from_account?: string | null
          to_account?: string | null
          tags?: string[] | null
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          category_id?: string | null
          date?: string
          description?: string | null
          notes?: string | null
          from_account?: string | null
          to_account?: string | null
          tags?: string[] | null
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      monthly_summary: {
        Row: {
          user_id: string
          full_name: string | null
          email: string
          month: string
          month_label: string
          total_income: number | null
          total_expenses: number | null
          net_savings: number | null
          transaction_count: number
        }
      }
      category_expenses: {
        Row: {
          user_id: string
          category_name: string | null
          icon: string | null
          color: string | null
          total_amount: number | null
          transaction_count: number
          percentage: number | null
        }
      }
      recent_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          date: string
          description: string | null
          category_name: string | null
          category_icon: string | null
          category_color: string | null
        }
      }
      user_financial_summary: {
        Row: {
          user_id: string
          full_name: string | null
          email: string
          currency: string
          current_month_income: number | null
          current_month_expenses: number | null
          current_month_transactions: number | null
        }
      }
    }
  }
}