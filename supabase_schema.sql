-- ══════════════════════════════════════════════════════════
--   ARTAQU FINANCIAL MANAGER - SUPABASE SCHEMA SETUP
-- ══════════════════════════════════════════════════════════
-- Copy and run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- to provision your PostgreSQL database tables with Row Level Security (RLS).
-- This script is safe to run multiple times.
-- ══════════════════════════════════════════════════════════

-- 1. Create INSTALLMENTS Table
CREATE TABLE IF NOT EXISTS public.installments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  creditor text NOT NULL,
  total_amount numeric(15, 2) NOT NULL CHECK (total_amount > 0),
  paid_amount numeric(15, 2) DEFAULT 0.00 NOT NULL CHECK (paid_amount >= 0),
  start_date date NOT NULL,
  due_date date,
  description text,
  status text DEFAULT 'Berjalan'::text NOT NULL CHECK (status in ('Berjalan', 'Lunas'))
);

-- Fix for missing default UUID generation (if table was created before)
ALTER TABLE public.installments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable Row Level Security for installments
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for installments
DROP POLICY IF EXISTS "Users can view their own installments" ON public.installments;
CREATE POLICY "Users can view their own installments"
  ON public.installments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own installments" ON public.installments;
CREATE POLICY "Users can insert their own installments"
  ON public.installments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own installments" ON public.installments;
CREATE POLICY "Users can update their own installments"
  ON public.installments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own installments" ON public.installments;
CREATE POLICY "Users can delete their own installments"
  ON public.installments FOR DELETE
  USING (auth.uid() = user_id);


-- 2. Create TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date date NOT NULL,
  type text NOT NULL CHECK (type in ('Pendapatan', 'Pengeluaran', 'Piutang', 'Cicilan')),
  category text NOT NULL,
  amount numeric(15, 2) NOT NULL CHECK (amount > 0),
  description text,
  installment_id uuid REFERENCES public.installments(id) ON DELETE SET NULL
);

-- Fix for missing default UUID generation (if table was created before)
ALTER TABLE public.transactions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable Row Level Security for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);


-- 3. Create Performance Indexes for Faster Queries
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(date desc);
CREATE INDEX IF NOT EXISTS installments_user_id_idx ON public.installments(user_id);
CREATE INDEX IF NOT EXISTS installments_status_idx ON public.installments(status);


-- 4. Create SAVINGS_GOALS Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  target_amount numeric(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(15, 2) DEFAULT 0.00 NOT NULL CHECK (current_amount >= 0),
  target_date date,
  description text,
  status text DEFAULT 'Berjalan'::text NOT NULL CHECK (status in ('Berjalan', 'Tercapai'))
);

-- Enable Row Level Security for savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for savings_goals
DROP POLICY IF EXISTS "Users can view their own savings goals" ON public.savings_goals;
CREATE POLICY "Users can view their own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own savings goals" ON public.savings_goals;
CREATE POLICY "Users can insert their own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own savings goals" ON public.savings_goals;
CREATE POLICY "Users can update their own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own savings goals" ON public.savings_goals;
CREATE POLICY "Users can delete their own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS savings_goals_user_id_idx ON public.savings_goals(user_id);

-- 5. Create ASSETS Table
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type in ('Kripto', 'Saham', 'Reksadana', 'Emas', 'Lainnya')),
  platform text,
  quantity numeric(20, 8) NOT NULL CHECK (quantity >= 0),
  average_price numeric(15, 2) NOT NULL CHECK (average_price >= 0),
  current_price numeric(15, 2) NOT NULL CHECK (current_price >= 0),
  total_deposit numeric(15, 2) DEFAULT 0.00,
  total_withdraw numeric(15, 2) DEFAULT 0.00
);

-- Enable Row Level Security for assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for assets
DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
CREATE POLICY "Users can view their own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
CREATE POLICY "Users can insert their own assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
CREATE POLICY "Users can update their own assets"
  ON public.assets FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;
CREATE POLICY "Users can delete their own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS assets_user_id_idx ON public.assets(user_id);
