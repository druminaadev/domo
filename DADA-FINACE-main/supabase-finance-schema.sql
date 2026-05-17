-- ============================================================================
-- SUPABASE PERSONAL FINANCE APP - DATABASE SCHEMA
-- ============================================================================
-- This schema includes:
-- 1. Users table (extends Supabase auth.users)
-- 2. Categories table for transaction categorization
-- 3. Transactions table for income/expense/transfer records
-- 4. Row-Level Security (RLS) policies
-- 5. Indexes for performance
-- 6. Sample data
-- 7. Example queries
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Profile Extension)
-- ============================================================================
-- Extends Supabase auth.users with additional profile information

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- Index for faster lookups
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
-- Predefined and custom categories for transactions

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT DEFAULT '#FF6D3D',
  is_system BOOLEAN DEFAULT FALSE, -- System categories cannot be deleted
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name, type) -- Prevent duplicate category names per user
);

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories table
CREATE POLICY "Users can view their own categories and system categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id OR is_system = TRUE);

CREATE POLICY "Users can insert their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update their own non-system categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete their own non-system categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- Indexes for faster lookups
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_type ON public.categories(type);
CREATE INDEX idx_categories_is_system ON public.categories(is_system);

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================
-- Core table for all financial transactions

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  notes TEXT,
  -- Transfer specific fields
  from_account TEXT, -- For transfers: source account
  to_account TEXT,   -- For transfers: destination account
  -- Metadata
  tags TEXT[], -- Array of tags for filtering
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);

-- GIN index for tags array
CREATE INDEX idx_transactions_tags ON public.transactions USING GIN(tags);

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SAMPLE DATA
-- ============================================================================

-- Insert system categories (these will be available to all users)
INSERT INTO public.categories (id, user_id, name, type, icon, color, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Salary', 'income', '💰', '#10B981', TRUE),
  ('00000000-0000-0000-0000-000000000002', NULL, 'Freelance', 'income', '💼', '#3B82F6', TRUE),
  ('00000000-0000-0000-0000-000000000003', NULL, 'Investment', 'income', '📈', '#8B5CF6', TRUE),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Food & Dining', 'expense', '🍔', '#EF4444', TRUE),
  ('00000000-0000-0000-0000-000000000005', NULL, 'Transportation', 'expense', '🚗', '#F59E0B', TRUE),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Shopping', 'expense', '🛍️', '#EC4899', TRUE),
  ('00000000-0000-0000-0000-000000000007', NULL, 'Entertainment', 'expense', '🎬', '#6366F1', TRUE),
  ('00000000-0000-0000-0000-000000000008', NULL, 'Bills & Utilities', 'expense', '📄', '#14B8A6', TRUE),
  ('00000000-0000-0000-0000-000000000009', NULL, 'Healthcare', 'expense', '🏥', '#F43F5E', TRUE),
  ('00000000-0000-0000-0000-000000000010', NULL, 'Education', 'expense', '📚', '#0EA5E9', TRUE)
ON CONFLICT DO NOTHING;

-- Example user data (replace with actual user IDs from auth.users)
-- Note: In production, users will be created through Supabase Auth
-- This is just for demonstration purposes

-- Assuming a user with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' exists
-- INSERT INTO public.users (id, email, full_name, currency) VALUES
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'john.doe@example.com', 'John Doe', 'USD');

-- Example custom category for a user
-- INSERT INTO public.categories (user_id, name, type, icon, color, is_system) VALUES
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Side Hustle', 'income', '💡', '#FF6D3D', FALSE);

-- Example transactions for a user
-- INSERT INTO public.transactions (user_id, type, amount, category_id, date, description, notes) VALUES
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 5000.00, '00000000-0000-0000-0000-000000000001', '2024-01-15', 'Monthly Salary', 'January 2024 salary'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 1500.00, '00000000-0000-0000-0000-000000000002', '2024-01-20', 'Freelance Project', 'Website development'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 450.00, '00000000-0000-0000-0000-000000000004', '2024-01-10', 'Grocery Shopping', 'Weekly groceries'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 80.00, '00000000-0000-0000-0000-000000000005', '2024-01-12', 'Gas Station', 'Fuel for car'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 200.00, '00000000-0000-0000-0000-000000000006', '2024-01-18', 'Online Shopping', 'New shoes'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 1000.00, NULL, '2024-01-25', 'Savings Transfer', 'Monthly savings', 'Checking', 'Savings'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 5000.00, '00000000-0000-0000-0000-000000000001', '2024-02-15', 'Monthly Salary', 'February 2024 salary'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 500.00, '00000000-0000-0000-0000-000000000004', '2024-02-08', 'Restaurant', 'Dinner with family'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 150.00, '00000000-0000-0000-0000-000000000008', '2024-02-05', 'Electricity Bill', 'Monthly utility'),
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 100.00, '00000000-0000-0000-0000-000000000007', '2024-02-20', 'Movie Tickets', 'Weekend entertainment');

-- ============================================================================
-- 6. USEFUL QUERIES
-- ============================================================================

-- Query 1: Monthly Income vs Expenses per User
-- This query shows total income and expenses grouped by month and year
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
  t.user_id,
  u.full_name,
  u.email,
  DATE_TRUNC('month', t.date) AS month,
  TO_CHAR(t.date, 'YYYY-MM') AS month_label,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) - 
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS net_savings,
  COUNT(*) AS transaction_count
FROM public.transactions t
JOIN public.users u ON t.user_id = u.id
WHERE t.type IN ('income', 'expense')
GROUP BY t.user_id, u.full_name, u.email, DATE_TRUNC('month', t.date), TO_CHAR(t.date, 'YYYY-MM')
ORDER BY t.user_id, month DESC;

-- Query 2: Category-wise Expense Breakdown
-- Shows expenses grouped by category for the current month
CREATE OR REPLACE VIEW category_expenses AS
SELECT 
  t.user_id,
  c.name AS category_name,
  c.icon,
  c.color,
  SUM(t.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  ROUND((SUM(t.amount) / NULLIF(
    (SELECT SUM(amount) FROM public.transactions 
     WHERE user_id = t.user_id 
     AND type = 'expense' 
     AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0
  ) * 100), 2) AS percentage
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY t.user_id, c.name, c.icon, c.color
ORDER BY total_amount DESC;

-- Query 3: Recent Transactions (Last 30 days)
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.date,
  t.description,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY t.date DESC, t.created_at DESC;

-- Query 4: User Financial Summary (Current Month)
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
  u.id AS user_id,
  u.full_name,
  u.email,
  u.currency,
  (SELECT SUM(amount) FROM public.transactions 
   WHERE user_id = u.id AND type = 'income' 
   AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS current_month_income,
  (SELECT SUM(amount) FROM public.transactions 
   WHERE user_id = u.id AND type = 'expense' 
   AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS current_month_expenses,
  (SELECT COUNT(*) FROM public.transactions 
   WHERE user_id = u.id 
   AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS current_month_transactions
FROM public.users u;

-- ============================================================================
-- 7. EXAMPLE SQL QUERIES TO RUN
-- ============================================================================

-- Example 1: Get monthly income vs expenses for a specific user
/*
SELECT 
  month_label,
  total_income,
  total_expenses,
  net_savings,
  CASE 
    WHEN net_savings > 0 THEN 'Surplus'
    WHEN net_savings < 0 THEN 'Deficit'
    ELSE 'Break Even'
  END AS status
FROM monthly_summary
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY month DESC
LIMIT 12;
*/

-- Example 2: Get top spending categories for current month
/*
SELECT 
  category_name,
  icon,
  total_amount,
  percentage || '%' AS percentage_of_total
FROM category_expenses
WHERE user_id = auth.uid()
ORDER BY total_amount DESC
LIMIT 10;
*/

-- Example 3: Get all transactions for a specific date range
/*
SELECT 
  t.date,
  t.type,
  t.amount,
  t.description,
  c.name AS category,
  c.icon
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY t.date DESC;
*/

-- Example 4: Calculate average monthly expenses by category
/*
SELECT 
  c.name AS category,
  ROUND(AVG(t.amount), 2) AS avg_amount,
  COUNT(*) AS transaction_count
FROM public.transactions t
JOIN public.categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.type = 'expense'
  AND t.date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY c.name
ORDER BY avg_amount DESC;
*/

-- ============================================================================
-- 8. SECURITY NOTES
-- ============================================================================
/*
1. All tables have Row-Level Security (RLS) enabled
2. Users can only access their own data through RLS policies
3. System categories are read-only for all users
4. auth.uid() function is used to get the authenticated user's ID
5. Foreign key constraints ensure data integrity
6. Indexes are created for optimal query performance
7. Triggers automatically update the updated_at timestamp
8. Check constraints validate data types and values
9. Unique constraints prevent duplicate entries
10. CASCADE deletes ensure cleanup when users are deleted
*/

-- ============================================================================
-- 9. SETUP INSTRUCTIONS
-- ============================================================================
/*
1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste this entire SQL script
4. Execute the script to create all tables, policies, and views
5. Enable Email authentication in Authentication > Providers
6. Users will be automatically added to auth.users when they sign up
7. Create a trigger to auto-create user profile:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

8. Use Supabase client libraries to interact with the database
9. All RLS policies will automatically enforce user data isolation
10. Test with multiple users to verify RLS is working correctly
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
