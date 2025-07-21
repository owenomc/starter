// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  // "https://owencrandall.com" - replace process.env.NEXT_PUBLIC_SUPABASE_URL! with your Supabase URL
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
