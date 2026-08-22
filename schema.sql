-- ==========================================
-- MessManager PRO - Supabase PostgreSQL Schema
-- ==========================================

-- 1. Messes Table
CREATE TABLE IF NOT EXISTS public.messes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    created_by_user_id TEXT,
    monthly_house_rent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    mess_id TEXT NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
    user_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'MEMBER', -- 'MANAGER', 'CO_MANAGER', 'MEMBER'
    deposit NUMERIC DEFAULT 0,
    monthly_rent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bazars Table
CREATE TABLE IF NOT EXISTS public.bazars (
    id TEXT PRIMARY KEY,
    mess_id TEXT NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
    spent_by_member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    items_note TEXT,
    added_to_deposit BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Meals Table
CREATE TABLE IF NOT EXISTS public.meals (
    id TEXT PRIMARY KEY,
    mess_id TEXT NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    breakfast NUMERIC DEFAULT 0,
    lunch NUMERIC DEFAULT 0,
    dinner NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mess_id, member_id, date)
);

-- 5. Rent Payments Table
CREATE TABLE IF NOT EXISTS public.rent_payments (
    id TEXT PRIMARY KEY,
    mess_id TEXT NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g. '2026-08'
    expected_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unpaid', -- 'paid', 'unpaid', 'partial'
    paid_at TEXT,
    payment_method TEXT DEFAULT 'bKash',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mess_id, member_id, month)
);

-- Enable Row Level Security (RLS) & Allow public read/write via anon key
ALTER TABLE public.messes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on messes" ON public.messes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on bazars" ON public.bazars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on meals" ON public.meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on rent_payments" ON public.rent_payments FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messes, public.members, public.bazars, public.meals, public.rent_payments;
