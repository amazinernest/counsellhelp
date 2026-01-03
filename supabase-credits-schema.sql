-- CounselHelp Credits Schema (Run after main schema)
-- Adds credits system for client messaging

-- ============================================
-- ADD CREDITS COLUMN TO PROFILES
-- Every new user gets 500 credits on signup
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 500;

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- Tracks all credit purchases and usage
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Positive = credit added, Negative = credit used
    type TEXT CHECK (type IN ('signup_bonus', 'purchase', 'usage', 'refund')) NOT NULL,
    description TEXT,
    payment_reference TEXT,
    paystack_reference TEXT,
    naira_amount INTEGER, -- Amount paid in kobo (for purchases)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for credit transactions
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);

-- ============================================
-- UPDATE TRIGGER FOR NEW USERS
-- Give 500 credits and log the signup bonus
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile with 500 credits
    INSERT INTO public.profiles (id, email, credits)
    VALUES (new.id, new.email, 500);
    
    -- Log the signup bonus transaction
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (new.id, 500, 'signup_bonus', 'Welcome bonus - 500 free credits');
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REALTIME FOR CREDIT TRANSACTIONS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'credit_transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;
    END IF;
END $$;

-- ============================================
-- UPDATE EXISTING USERS WITH 500 CREDITS
-- Only if they have NULL credits
-- ============================================
UPDATE public.profiles 
SET credits = 500 
WHERE credits IS NULL;

-- ============================================
-- SUCCESS!
-- ============================================
-- Run this in your Supabase SQL Editor.
-- New users will automatically get 500 credits.
-- Existing users with NULL credits will be updated to 500.
