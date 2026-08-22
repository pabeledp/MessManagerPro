import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvmwansxdjaidbuqmmit.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bXdhbnN4ZGphaWRidXFtbWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzI4MDMsImV4cCI6MjEwMjk0ODgwM30.c-dwc6_zMwkZJJDuhH6kuGZ3z4Ff8APBEqO4PErie8c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
