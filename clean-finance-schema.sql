-- ============================================================================
-- CLEAN FINANCE APP DATABASE SCHEMA
-- ============================================================================
-- Error-free version with proper constraints and indexes
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD')),
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL CHECK (length(name) > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(20),
  color VARCHAR(7) DEFAULT '#FF6D3D' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_category UNIQUE(user_id, name, type)
);

-- Indexes for categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_system ON categories(is_system);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- ============================================================================
-- 3. ACCOUNTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'cash')),
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_account UNIQUE(user_id, name)
);

-- Indexes for accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- ============================================================================
-- 4. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description VARCHAR(255),
  notes TEXT,
  from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(10) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Business logic constraints
  CONSTRAINT valid_transfer_accounts CHECK (
    (type != 'transfer') OR 
    (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL)
  ),
  CONSTRAINT valid_recurring CHECK (
    (is_recurring = FALSE) OR 
    (is_recurring = TRUE AND recurring_frequency IS NOT NULL)
  ),
  CONSTRAINT valid_date CHECK (transaction_date <= CURRENT_DATE + INTERVAL '1 day')
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_deleted ON transactions(is_deleted);
CREATE INDEX idx_transactions_recurring ON transactions(is_recurring);
CREATE INDEX idx_transactions_tags ON transactions USING GIN(tags);

-- ============================================================================
-- 5. BUDGETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_budget_dates CHECK (end_date > start_date)
);

-- Indexes for budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_active ON budgets(is_active);

-- ============================================================================
-- 6. RECURRING_TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_execution_date DATE NOT NULL,
  last_execution_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for recurring transactions
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_template ON recurring_transactions(template_transaction_id);
CREATE INDEX idx_recurring_next_date ON recurring_transactions(next_execution_date);
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active);

-- ============================================================================
-- 7. UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate account balance
CREATE OR REPLACE FUNCTION calculate_account_balance(account_uuid UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  balance DECIMAL(15, 2) := 0;
BEGIN
  -- Calculate income
  SELECT COALESCE(SUM(amount), 0) INTO balance
  FROM transactions 
  WHERE account_id = account_uuid 
    AND type = 'income' 
    AND is_deleted = FALSE;
  
  -- Subtract expenses
  SELECT balance - COALESCE(SUM(amount), 0) INTO balance
  FROM transactions 
  WHERE account_id = account_uuid 
    AND type = 'expense' 
    AND is_deleted = FALSE;
  
  -- Handle transfers
  SELECT balance + COALESCE(SUM(amount), 0) INTO balance
  FROM transactions 
  WHERE to_account_id = account_uuid 
    AND type = 'transfer' 
    AND is_deleted = FALSE;
  
  SELECT balance - COALESCE(SUM(amount), 0) INTO balance
  FROM transactions 
  WHERE from_account_id = account_uuid 
    AND type = 'transfer' 
    AND is_deleted = FALSE;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
  BEFORE UPDATE ON accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON budgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_updated_at 
  BEFORE UPDATE ON recurring_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample user
INSERT INTO users (email, full_name, currency) VALUES 
('john.doe@example.com', 'John Doe', 'USD')
ON CONFLICT (email) DO NOTHING;

-- Get user ID for sample data
DO $$
DECLARE
  sample_user_id UUID;
  checking_account_id UUID;
  savings_account_id UUID;
  food_category_id UUID;
  salary_category_id UUID;
BEGIN
  -- Get sample user ID
  SELECT id INTO sample_user_id FROM users WHERE email = 'john.doe@example.com';
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample categories
    INSERT INTO categories (user_id, name, type, icon, color) VALUES 
    (sample_user_id, 'Food & Dining', 'expense', '🍽️', '#FF6B6B'),
    (sample_user_id, 'Transportation', 'expense', '🚗', '#4ECDC4'),
    (sample_user_id, 'Salary', 'income', '💰', '#45B7D1'),
    (sample_user_id, 'Freelance', 'income', '💼', '#96CEB4')
    ON CONFLICT (user_id, name, type) DO NOTHING;
    
    -- Get category IDs
    SELECT id INTO food_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Food & Dining';
    SELECT id INTO salary_category_id FROM categories WHERE user_id = sample_user_id AND name = 'Salary';
    
    -- Insert sample accounts
    INSERT INTO accounts (user_id, name, type, balance) VALUES 
    (sample_user_id, 'Main Checking', 'checking', 5000.00),
    (sample_user_id, 'Emergency Savings', 'savings', 10000.00)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Get account IDs
    SELECT id INTO checking_account_id FROM accounts WHERE user_id = sample_user_id AND name = 'Main Checking';
    SELECT id INTO savings_account_id FROM accounts WHERE user_id = sample_user_id AND name = 'Emergency Savings';
    
    -- Insert sample transactions
    INSERT INTO transactions (user_id, account_id, category_id, type, amount, transaction_date, description) VALUES 
    (sample_user_id, checking_account_id, salary_category_id, 'income', 3000.00, CURRENT_DATE - INTERVAL '5 days', 'Monthly Salary'),
    (sample_user_id, checking_account_id, food_category_id, 'expense', 45.50, CURRENT_DATE - INTERVAL '2 days', 'Grocery Shopping'),
    (sample_user_id, checking_account_id, food_category_id, 'expense', 25.00, CURRENT_DATE - INTERVAL '1 day', 'Restaurant Lunch');
    
    -- Insert sample budget
    INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, end_date) VALUES 
    (sample_user_id, food_category_id, 'Monthly Food Budget', 500.00, 'monthly', 
     DATE_TRUNC('month', CURRENT_DATE), 
     DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day');
  END IF;
END $$;

-- ============================================================================
-- 10. USEFUL VIEWS
-- ============================================================================

-- View for transaction summary by category
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  t.user_id,
  c.name as category_name,
  c.type as category_type,
  DATE_TRUNC('month', t.transaction_date) as month,
  COUNT(*) as transaction_count,
  SUM(t.amount) as total_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.is_deleted = FALSE
GROUP BY t.user_id, c.name, c.type, DATE_TRUNC('month', t.transaction_date);

-- View for account balances
CREATE OR REPLACE VIEW account_balances AS
SELECT 
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.balance as stored_balance,
  calculate_account_balance(a.id) as calculated_balance
FROM accounts a
WHERE a.is_active = TRUE;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================