import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 *
 * We create two clients:
 * 1. supabase - Client-side with anon key (respects RLS policies)
 * 2. supabaseAdmin - Server-side with service role (bypasses RLS)
 *
 * IMPORTANT: Never expose supabaseAdmin to client-side code
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Client-side Supabase client
 * Use this for client components and browser-side operations
 * Respects Row Level Security (RLS) policies
 *
 * Note: Will be null if environment variables are not configured
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Server-side Supabase admin client
 * Use this ONLY in API routes and server components
 * Bypasses RLS - use with caution
 *
 * Note: Will be null if environment variables are not configured
 */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/**
 * Helper to check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Database Types
 * These match the Supabase table schema for type safety
 */
export interface Lead {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  industry: string;
  monthly_calls_missed: number | null;
  ip_address: string | null;
  created_at: string;
  demo_booked: boolean;
  demo_booked_at: string | null;
}

export type LeadInsert = Omit<Lead, "id" | "created_at" | "demo_booked" | "demo_booked_at">;
