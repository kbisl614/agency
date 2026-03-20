import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "needs_attention";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = supabaseAdmin
    .from("actions")
    .select("id, description, status, action_type, agent_name, created_at")
    .eq("contractor_id", profile.contractor_id)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tab === "needs_attention") {
    // Exclude human_review — those are in the inbox
    query = query.in("status", ["awaiting_customer", "failed"]);
  } else {
    query = query.in("status", ["auto_executed", "human_approved", "human_skipped", "jobber_synced"]);
  }

  const { data: items } = await query;
  return NextResponse.json(items ?? []);
}
