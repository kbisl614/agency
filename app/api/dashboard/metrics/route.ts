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

  const { contractor_id } = profile;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Load in parallel
  const [{ data: _client }, { data: actions }, { data: todayActions }] = await Promise.all([
    supabaseAdmin.from("clients").select("agents_active").eq("contractor_id", contractor_id).single(),
    supabaseAdmin
      .from("actions")
      .select("revenue_impact, response_time_ms, status, created_at")
      .eq("contractor_id", contractor_id)
      .gte("created_at", monthStart.toISOString()),
    supabaseAdmin
      .from("actions")
      .select("id")
      .eq("contractor_id", contractor_id)
      .gte("created_at", todayStart.toISOString()),
  ]);

  const allActions = actions ?? [];

  const revenue_mtd = allActions.reduce(
    (sum, a) => sum + (a.revenue_impact ?? 0), 0
  );

  const leadsActions = allActions.filter(
    (a) => a.status === "auto_executed" || a.status === "human_approved"
  );
  const leads_recovered = leadsActions.length;

  const responseTimes = allActions
    .map((a) => a.response_time_ms)
    .filter((t): t is number => t != null && t > 0);
  const avg_response_ms = responseTimes.length
    ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length)
    : 0;

  return NextResponse.json({
    revenue_mtd,
    retainer_amount: 1500,
    leads_recovered,
    leads_guarantee: 5,
    avg_response_ms,
    actions_today: todayActions?.length ?? 0,
    last_updated: new Date().toISOString(),
  });
}
