import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: items } = await supabaseAdmin
    .from("actions")
    .select("id, description, revenue_impact, confidence_score, created_at, action_type")
    .eq("contractor_id", profile.contractor_id)
    .eq("status", "human_review")
    .order("created_at", { ascending: false });

  return NextResponse.json(items ?? []);
}
