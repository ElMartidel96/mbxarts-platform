/**
 * SUPABASE CLIENT FOR LEADS
 * Lazy singleton - returns null if not configured (Redis is primary)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let initialized = false;

export function getLeadsSupabase(): SupabaseClient | null {
  if (initialized) return supabase;
  initialized = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('⚠️ Supabase not configured for leads - using Redis only');
    return null;
  }

  try {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    console.log('✅ Supabase client initialized for leads');
    return supabase;
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed for leads:', (error as Error).message);
    return null;
  }
}
