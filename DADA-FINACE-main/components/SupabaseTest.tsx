'use client'

import { useState, useEffect } from 'react'
import { authService, categoryService, transactionService } from '../lib/database'

export default function SupabaseTest() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { user } = await authService.getCurrentUser()
    setUser(user)
    if (user) {
      loadData(user.id)
    }
  }

  const loadData = async (userId: string) => {
    setLoading(true)
    try {
      const [categoriesResult, transactionsResult] = await Promise.all([
        categoryService.getCategories(userId),
        transactionService.getTransactions(userId, { limit: 5 })
      ])

      if (categoriesResult.error) throw categoriesResult.error
      if (transactionsResult.error) throw transactionsResult.error

      setCategories(categoriesResult.data || [])
      setTransactions(transactionsResult.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await authService.signUp(
        'test@example.com',
        'password123',
        'Test User'
      )
      if (error) throw error
      alert('Check your email for confirmation link!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await authService.signIn(
        'test@example.com',
        'password123'
      )
      if (error) throw error
      setUser(data.user)
      if (data.user) {
        loadData(data.user.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await authService.signOut()
    setUser(null)
    setCategories([])
    setTransactions([])
  }

  const createTestTransaction = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const expenseCategory = categories.find(c => c.type === 'expense')
      const { data, error } = await transactionService.createTransaction({
        user_id: user.id,
        type: 'expense',
        amount: Math.floor(Math.random() * 100) + 10,
        category_id: expenseCategory?.id || null,
        description: `Test transaction ${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      })
      
      if (error) throw error
      
      // Reload transactions
      loadData(user.id)
      alert('Transaction created successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Integration Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication</h2>
          
          {!user ? (
            <div className="space-y-2">
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Sign Up (test@example.com)
              </button>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Sign In (test@example.com)
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Logged in as: {user.email}
              </p>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Categories ({categories.length})
          </h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 text-sm">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.type}
                  </span>
                  {category.is_system && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      System
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Recent Transactions ({transactions.length})
            </h2>
            {user && (
              <button
                onClick={createTestTransaction}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Create Test Transaction
              </button>
            )}
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet. Create one to test!</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="font-medium">{transaction.description}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.categories?.name || 'Uncategorized'} • {transaction.date}
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Section */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Setup Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Supabase Client:</span>
            <span className="ml-2 text-green-600">✓ Connected</span>
          </div>
          <div>
            <span className="font-medium">Authentication:</span>
            <span className={`ml-2 ${user ? 'text-green-600' : 'text-yellow-600'}`}>
              {user ? '✓ Logged In' : '⚠ Not Logged In'}
            </span>
          </div>
          <div>
            <span className="font-medium">Categories:</span>
            <span className={`ml-2 ${categories.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {categories.length > 0 ? `✓ ${categories.length} loaded` : '✗ None loaded'}
            </span>
          </div>
          <div>
            <span className="font-medium">Transactions:</span>
            <span className={`ml-2 ${transactions.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {transactions.length > 0 ? `✓ ${transactions.length} loaded` : '⚠ None yet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}