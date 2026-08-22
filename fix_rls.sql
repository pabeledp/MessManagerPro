-- =========================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO ENABLE ANONYMOUS ACCESS
-- =========================================================

-- Disable RLS or Add Open Policies for Anon:
ALTER TABLE IF EXISTS public.messes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bazars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rent_payments DISABLE ROW LEVEL SECURITY;

-- Create tables if not already created
CREATE TABLE IF NOT EXISTS public.messes (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    mess_id BIGINT REFERENCES public.messes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    deposit NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bazars (
    id BIGSERIAL PRIMARY KEY,
    mess_id BIGINT REFERENCES public.messes(id) ON DELETE CASCADE,
    spent_by TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    items_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meals (
    id BIGSERIAL PRIMARY KEY,
    mess_id BIGINT REFERENCES public.messes(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    count NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
