-- ============================================================================
-- SUPABASE FINANCE APP - ENHANCED DATABASE SCHEMA
-- ============================================================================
-- Enhanced version with improved RLS policies, better error handling,
-- and additional security measures
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE (Profile Extension)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD')),
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

-- Enhanced RLS Policies for users table
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 50),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT CHECK (length(icon) <= 10),
  color TEXT DEFAULT '#FF6D3D' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own categories and system categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own non-system categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own non-system categories" ON public.categories;

-- Enhanced RLS Policies
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_system = TRUE AND is_active = TRUE)
  );

CREATE POLICY "categories_insert" ON public.categories
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    is_system = FALSE AND
    user_id IS NOT NULL
  );

CREATE POLICY "categories_update" ON public.categories
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    is_system = FALSE
  ) WITH CHECK (
    auth.uid() = user_id AND 
    is_system = FALSE
  );

CREATE POLICY "categories_delete" ON public.categories
  FOR DELETE USING (
    auth.uid() = user_id AND 
    is_system = FALSE
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_system ON public.categories(is_system);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_system_active ON public.categories(is_system, is_active) WHERE is_system = TRUE;

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE CHECK (date <= CURRENT_DATE + INTERVAL '1 day'),
  description TEXT CHECK (length(description) <= 255),
  notes TEXT CHECK (length(notes) <= 1000),
  from_account TEXT CHECK (length(from_account) <= 100),
  to_account TEXT CHECK (length(to_account) <= 100),
  tags TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_transfer_accounts CHECK (
    (type != 'transfer') OR 
    (type = 'transfer' AND from_account IS NOT NULL AND to_account IS NOT NULL)
  ),
  CONSTRAINT valid_recurring CHECK (
    (is_recurring = FALSE) OR 
    (is_recurring = TRUE AND recurring_frequency IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Enhanced RLS Policies
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_deleted ON public.transactions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_transactions_active ON public.transactions(user_id, date DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON public.transactions USING GIN(tags);

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Enhanced update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create user profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.transactions 
  SET is_deleted = TRUE, updated_at = NOW()
  WHERE id = OLD.id;
  RETURN NULL; -- Prevent actual deletion
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS soft_delete_transactions ON public.transactions;

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER soft_delete_transactions
  BEFORE DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION soft_delete_transaction();

-- ============================================================================
-- 5. ENHANCED VIEWS WITH BETTER PERFORMANCE
-- ============================================================================

-- Drop existing views
DROP VIEW IF EXISTS monthly_summary;
DROP VIEW IF EXISTS category_expenses;
DROP VIEW IF EXISTS recent_transactions;
DROP VIEW IF EXISTS user_financial_summary;

-- Monthly Summary View
CREATE VIEW monthly_summary AS
SELECT 
  t.user_id,
  u.full_name,
  u.email,
  u.currency,
  DATE_TRUNC('month', t.date) AS month,
  TO_CHAR(t.date, 'YYYY-MM') AS month_label,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS total_expenses,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) - 
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS net_savings,
  COUNT(*) AS transaction_count
FROM public.transactions t
JOIN public.users u ON t.user_id = u.id
WHERE t.type IN ('income', 'expense') AND t.is_deleted = FALSE
GROUP BY t.user_id, u.full_name, u.email, u.currency, DATE_TRUNC('month', t.date), TO_CHAR(t.date, 'YYYY-MM')
ORDER BY t.user_id, month DESC;

-- Category Expenses View
CREATE VIEW category_expenses AS
SELECT 
  t.user_id,
  COALESCE(c.name, 'Uncategorized') AS category_name,
  c.icon,
  c.color,
  SUM(t.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  ROUND(
    (SUM(t.amount) / NULLIF(
      (SELECT SUM(amount) FROM public.transactions 
       WHERE user_id = t.user_id 
       AND type = 'expense' 
       AND is_deleted = FALSE
       AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
      ), 0
    ) * 100), 2
  ) AS percentage
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND t.is_deleted = FALSE
  AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY t.user_id, c.name, c.icon, c.color
ORDER BY total_amount DESC;

-- Recent Transactions View
CREATE VIEW recent_transactions AS
SELECT 
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.date,
  t.description,
  t.notes,
  COALESCE(c.name, 'Uncategorized') AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  t.tags,
  t.created_at
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.date >= CURRENT_DATE - INTERVAL '30 days'
  AND t.is_deleted = FALSE
ORDER BY t.date DESC, t.created_at DESC;

-- User Financial Summary View
CREATE VIEW user_financial_summary AS
SELECT 
  u.id AS user_id,
  u.full_name,
  u.email,
  u.currency,
  COALESCE(
    (SELECT SUM(amount) FROM public.transactions 
     WHERE user_id = u.id AND type = 'income' AND is_deleted = FALSE
     AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0
  ) AS current_month_income,
  COALESCE(
    (SELECT SUM(amount) FROM public.transactions 
     WHERE user_id = u.id AND type = 'expense' AND is_deleted = FALSE
     AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0
  ) AS current_month_expenses,
  COALESCE(
    (SELECT COUNT(*) FROM public.transactions 
     WHERE user_id = u.id AND is_deleted = FALSE
     AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0
  ) AS current_month_transactions,
  COALESCE(
    (SELECT SUM(amount) FROM public.transactions 
     WHERE user_id = u.id AND type = 'income' AND is_deleted = FALSE
    ), 0
  ) AS total_income,
  COALESCE(
    (SELECT SUM(amount) FROM public.transactions 
     WHERE user_id = u.id AND type = 'expense' AND is_deleted = FALSE
    ), 0
  ) AS total_expenses
FROM public.users u;

-- ============================================================================
-- 6. SYSTEM CATEGORIES DATA
-- ============================================================================

-- Insert system categories with proper error handling
INSERT INTO public.categories (id, user_id, name, type, icon, color, is_system, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Salary', 'income', '💰', '#10B981', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000002', NULL, 'Freelance', 'income', '💼', '#3B82F6', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000003', NULL, 'Investment', 'income', '📈', '#8B5CF6', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Business', 'income', '🏢', '#059669', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000005', NULL, 'Food & Dining', 'expense', '🍔', '#EF4444', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Transportation', 'expense', '🚗', '#F59E0B', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000007', NULL, 'Shopping', 'expense', '🛍️', '#EC4899', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000008', NULL, 'Entertainment', 'expense', '🎬', '#6366F1', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000009', NULL, 'Bills & Utilities', 'expense', '📄', '#14B8A6', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000010', NULL, 'Healthcare', 'expense', '🏥', '#F43F5E', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000011', NULL, 'Education', 'expense', '📚', '#0EA5E9', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000012', NULL, 'Travel', 'expense', '✈️', '#8B5CF6', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000013', NULL, 'Insurance', 'expense', '🛡️', '#6B7280', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000014', NULL, 'Savings', 'expense', '🏦', '#059669', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's monthly budget summary
CREATE OR REPLACE FUNCTION get_monthly_budget_summary(target_user_id UUID, target_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  month_label TEXT,
  total_income DECIMAL,
  total_expenses DECIMAL,
  net_savings DECIMAL,
  transaction_count BIGINT,
  top_expense_category TEXT,
  top_expense_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      TO_CHAR(target_month, 'YYYY-MM') as month_label,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) as total_income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as total_expenses,
      COUNT(*) as transaction_count
    FROM public.transactions t
    WHERE t.user_id = target_user_id 
      AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', target_month)
      AND t.is_deleted = FALSE
      AND t.type IN ('income', 'expense')
  ),
  top_category AS (
    SELECT 
      COALESCE(c.name, 'Uncategorized') as category_name,
      SUM(t.amount) as category_amount
    FROM public.transactions t
    LEFT JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = target_user_id 
      AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', target_month)
      AND t.type = 'expense'
      AND t.is_deleted = FALSE
    GROUP BY c.name
    ORDER BY category_amount DESC
    LIMIT 1
  )
  SELECT 
    md.month_label,
    md.total_income,
    md.total_expenses,
    (md.total_income - md.total_expenses) as net_savings,
    md.transaction_count,
    tc.category_name,
    tc.category_amount
  FROM monthly_data md
  LEFT JOIN top_category tc ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate transaction data
CREATE OR REPLACE FUNCTION validate_transaction_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate amount
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Transaction amount must be positive';
  END IF;
  
  -- Validate date (not too far in future)
  IF NEW.date > CURRENT_DATE + INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Transaction date cannot be more than 7 days in the future';
  END IF;
  
  -- Validate category belongs to user or is system category
  IF NEW.category_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.categories c 
      WHERE c.id = NEW.category_id 
      AND (c.user_id = NEW.user_id OR c.is_system = TRUE)
      AND c.is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'Invalid category for this user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_transaction_data_trigger ON public.transactions;
CREATE TRIGGER validate_transaction_data_trigger
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_data();

-- ============================================================================
-- 8. SECURITY ENHANCEMENTS
-- ============================================================================

-- Enable RLS on all tables (double-check)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Revoke unnecessary permissions from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- ============================================================================
-- 9. PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON public.transactions(user_id, type, date DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date ON public.transactions(user_id, category_id, date DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_categories_user_type_active ON public.categories(user_id, type, is_active);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_recent ON public.transactions(user_id, date DESC) 
  WHERE date >= CURRENT_DATE - INTERVAL '90 days' AND is_deleted = FALSE;

-- ============================================================================
-- END OF ENHANCED SCHEMA
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced Supabase Finance Schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your environment variables with Supabase credentials';
  RAISE NOTICE '2. Enable Email authentication in Supabase Dashboard';
  RAISE NOTICE '3. Test user registration and data insertion';
  RAISE NOTICE '4. Configure any additional authentication providers if needed';
END $$;