import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Category = Tables['categories']['Row']
type Transaction = Tables['transactions']['Row']

// Auth functions
export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// User profile functions
export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async getFinancialSummary(userId: string) {
    const { data, error } = await supabase
      .from('user_financial_summary')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },
}

// Category functions
export const categoryService = {
  async getCategories(userId: string, type?: 'income' | 'expense') {
    let query = supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .eq('is_active', true)
      .order('is_system', { ascending: false })
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createCategory(category: Tables['categories']['Insert']) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    return { data, error }
  },

  async updateCategory(id: string, updates: Tables['categories']['Update']) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('is_system', false)
      .select()
      .single()
    return { data, error }
  },

  async deleteCategory(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('is_system', false)
    return { data, error }
  },
}

// Transaction functions
export const transactionService = {
  async getTransactions(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: 'income' | 'expense' | 'transfer'
      categoryId?: string
      startDate?: string
      endDate?: string
      search?: string
    }
  ) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.search) {
      query = query.or(`description.ilike.%${options.search}%,notes.ilike.%${options.search}%`)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getRecentTransactions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('recent_transactions')
      .select('*')
      .eq('user_id', userId)
      .limit(limit)
    return { data, error }
  },

  async createTransaction(transaction: Tables['transactions']['Insert']) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .single()
    return { data, error }
  },

  async updateTransaction(id: string, updates: Tables['transactions']['Update']) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .single()
    return { data, error }
  },

  async deleteTransaction(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  async getMonthlySummary(userId: string, months = 12) {
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
      .limit(months)
    return { data, error }
  },

  async getCategoryExpenses(userId: string) {
    const { data, error } = await supabase
      .from('category_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('total_amount', { ascending: false })
    return { data, error }
  },

  async getMonthlyBudgetSummary(userId: string, targetMonth?: string) {
    const { data, error } = await supabase.rpc('get_monthly_budget_summary', {
      target_user_id: userId,
      target_month: targetMonth || new Date().toISOString().split('T')[0],
    })
    return { data, error }
  },
}

// Real-time subscriptions
export const subscriptionService = {
  subscribeToTransactions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  subscribeToCategories(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription)
  },
}

// Error handling utility
export const handleSupabaseError = (error: any) => {
  if (!error) return null

  // Common error messages
  const errorMessages: Record<string, string> = {
    'duplicate key value violates unique constraint': 'This item already exists',
    'new row violates row-level security policy': 'You do not have permission to perform this action',
    'invalid input syntax': 'Invalid data format',
    'foreign key constraint': 'Referenced item does not exist',
  }

  const message = error.message || 'An unexpected error occurred'
  
  // Check for known error patterns
  for (const [pattern, userMessage] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(pattern)) {
      return userMessage
    }
  }

  return message
}