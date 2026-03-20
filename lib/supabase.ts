import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Server-side admin client (service role — bypasses RLS).
 * Use ONLY in API routes and server actions. Never expose to the browser.
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
 * Browser client factory (anon key — respects RLS).
 * Call once per Client Component; do not share across requests.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// ─── Marketing lead types (used by /api/submit-lead) ──────────────────────────

export interface MarketingLead {
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

export type MarketingLeadInsert = Omit<
  MarketingLead,
  "id" | "created_at" | "demo_booked" | "demo_booked_at"
>;

// ─── Dashboard database types ──────────────────────────────────────────────────

export interface Client {
  contractor_id: string;
  business_name: string;
  first_name: string | null;
  owner_email: string;
  owner_phone: string;
  signalwire_number: string | null;
  crm_type: "jobber" | "servicetitan" | "housecallpro" | "other";
  business_hours: Record<string, string> | null;
  jobber_api_key: string | null;
  review_link: string | null;
  agents_active: {
    responder: boolean;
    quoter: boolean;
    dispatcher: boolean;
    advisor: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface DashboardUser {
  id: string;
  contractor_id: string;
  email: string;
  role: "admin" | "client";
  created_at: string;
}

export interface DashboardLead {
  lead_id: string;
  contractor_id: string;
  customer_name: string;
  phone: string;
  message: string | null;
  urgency_score: number | null;
  service_type: string | null;
  status: "new" | "contacted" | "booked" | "closed";
  created_at: string;
}

export interface Action {
  action_id: string;
  contractor_id: string;
  action_type: string;
  description: string;
  revenue_impact: number | null;
  agent_name: "responder" | "quoter" | "dispatcher" | "advisor";
  confidence_score: number | null;
  success: boolean;
  created_at: string;
}

export interface WorkflowPerformance {
  date: string;
  contractor_id: string;
  workflow_id: string;
  leads_created: number;
  sms_sent: number;
  errors: number;
  success_rate: number;
  avg_response_time: number;
}
