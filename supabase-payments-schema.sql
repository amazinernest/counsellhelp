-- CounselHelp Payment Schema (Run after main schema)
-- Adds tables for sessions, payments, and earnings tracking

-- ============================================
-- SESSIONS TABLE
-- Tracks booked counseling sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    counselor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
    amount INTEGER NOT NULL, -- Amount in kobo (₦5000 = 500000 kobo)
    commission INTEGER NOT NULL, -- Platform commission in kobo
    counselor_payout INTEGER NOT NULL, -- Counselor payout in kobo
    payment_reference TEXT UNIQUE,
    paystack_reference TEXT,
    paystack_access_code TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = counselor_id);

CREATE POLICY "Clients can create sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = counselor_id);

-- ============================================
-- COUNSELOR EARNINGS TABLE
-- Tracks earnings for each counselor
-- ============================================
CREATE TABLE IF NOT EXISTS public.counselor_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counselor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in kobo
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.counselor_earnings ENABLE ROW LEVEL SECURITY;

-- Policies for counselor earnings
CREATE POLICY "Counselors can view own earnings" ON public.counselor_earnings
    FOR SELECT USING (auth.uid() = counselor_id);

CREATE POLICY "System can insert earnings" ON public.counselor_earnings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update earnings" ON public.counselor_earnings
    FOR UPDATE USING (true);

-- ============================================
-- PLATFORM EARNINGS TABLE
-- Tracks platform commission earnings
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in kobo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

-- Only admins should view platform earnings (no policy = deny all for regular users)
-- You can add admin policies later

-- ============================================
-- ADD AVATAR URL TO PROFILES
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sessions_client ON public.sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_counselor ON public.sessions(counselor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_counselor_earnings_counselor ON public.counselor_earnings(counselor_id);

-- ============================================
-- REALTIME FOR SESSIONS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
    END IF;
END $$;

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see "Success. No rows returned" then the payment schema was created.
