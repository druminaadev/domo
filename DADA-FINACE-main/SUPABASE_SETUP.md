# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in project details:
   - Name: `finance-app` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Configure Environment Variables

1. Update your `.env.local` file with the actual values:

```env
# Replace with your actual Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Replace with your actual anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replace with your actual service role key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase-enhanced-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. You should see a success message: "Enhanced Supabase Finance Schema created successfully!"

## 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: Toggle based on your needs
   - **Enable secure email change**: Recommended to keep enabled
4. Optional: Configure additional providers (Google, GitHub, etc.)

## 6. Set Up Row Level Security (RLS)

The schema automatically sets up RLS policies, but verify they're working:

1. Go to **Authentication** → **Policies**
2. You should see policies for:
   - `users` table: 4 policies
   - `categories` table: 4 policies  
   - `transactions` table: 4 policies
3. All policies should be **Enabled**

## 7. Install Dependencies

Run the following command to install Supabase client:

```bash
npm install @supabase/supabase-js
```

## 8. Test the Setup

### Test 1: User Registration
```typescript
import { authService } from './lib/database'

// Test user registration
const testSignUp = async () => {
  const { data, error } = await authService.signUp(
    'test@example.com',
    'password123',
    'Test User'
  )
  console.log('Sign up result:', { data, error })
}
```

### Test 2: Create Transaction
```typescript
import { transactionService } from './lib/database'

// Test transaction creation (after user is logged in)
const testTransaction = async () => {
  const { data, error } = await transactionService.createTransaction({
    user_id: 'user-id-here',
    type: 'expense',
    amount: 50.00,
    description: 'Test transaction',
    date: new Date().toISOString().split('T')[0]
  })
  console.log('Transaction result:', { data, error })
}
```

### Test 3: Get Categories
```typescript
import { categoryService } from './lib/database'

// Test getting categories
const testCategories = async () => {
  const { data, error } = await categoryService.getCategories('user-id-here')
  console.log('Categories:', { data, error })
}
```

## 9. Verify Database Tables

In Supabase dashboard, go to **Table Editor** and verify these tables exist:
- ✅ `users`
- ✅ `categories` (with system categories pre-populated)
- ✅ `transactions`

## 10. Common Issues & Solutions

### Issue: "new row violates row-level security policy"
**Solution**: Make sure the user is authenticated and the `auth.uid()` matches the `user_id` in the data.

### Issue: "relation does not exist"
**Solution**: Re-run the SQL schema. Make sure all tables were created successfully.

### Issue: "Invalid API key"
**Solution**: Double-check your environment variables. Make sure you're using the correct project URL and keys.

### Issue: Categories not showing
**Solution**: System categories should be automatically inserted. Check the `categories` table in Table Editor.

### Issue: Authentication not working
**Solution**: 
1. Verify email provider is enabled
2. Check if email confirmation is required
3. Look at Authentication → Users to see if users are being created

## 11. Production Considerations

### Security Checklist:
- ✅ RLS policies are enabled on all tables
- ✅ Service role key is kept secret (server-side only)
- ✅ Anon key is used for client-side operations
- ✅ Input validation is implemented
- ✅ Proper error handling is in place

### Performance Optimizations:
- ✅ Indexes are created for common queries
- ✅ Views are optimized for dashboard queries
- ✅ Soft deletes prevent data loss
- ✅ Triggers handle automatic updates

### Monitoring:
1. Set up **Database** → **Logs** monitoring
2. Monitor **Authentication** → **Users** for user activity
3. Use **API** → **Logs** to debug API calls

## 12. Next Steps

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Test user registration** in your app
4. **Create sample transactions** to verify everything works
5. **Set up real-time subscriptions** for live updates
6. **Configure email templates** in Authentication → Email Templates
7. **Set up database backups** in Settings → Database

## 13. Useful SQL Queries for Testing

```sql
-- Check if system categories were created
SELECT * FROM public.categories WHERE is_system = true;

-- Check user profiles
SELECT * FROM public.users;

-- Check recent transactions
SELECT * FROM recent_transactions LIMIT 10;

-- Check monthly summary
SELECT * FROM monthly_summary;

-- Test RLS (should only return current user's data)
SELECT * FROM public.transactions;
```

## Support

If you encounter issues:
1. Check Supabase **Logs** in the dashboard
2. Verify your environment variables
3. Test API calls in the **API Docs** section
4. Check the **Database** → **Logs** for SQL errors

Your Supabase finance app is now ready to use! 🎉