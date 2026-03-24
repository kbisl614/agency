import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: profile } = await supabaseAdmin
    .from("users").select("contractor_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action_id, decision } = await request.json();
  if (!action_id || !["approved", "skipped"].includes(decision)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = decision === "approved" ? "human_approved" : "human_skipped";

  // Verify this action belongs to this contractor
  const { data: action } = await supabaseAdmin
    .from("actions")
    .select("id, contractor_id")
    .eq("id", action_id)
    .eq("contractor_id", profile.contractor_id)
    .single();

  if (!action) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update status immediately — don't wait on n8n
  await supabaseAdmin
    .from("actions")
    .update({ status: newStatus })
    .eq("id", action_id);

  // Fire n8n webhook (best-effort, 2s timeout)
  // Note: project uses N8N_WEBHOOK_BASE_URL (from .env.local) — the spec calls it N8N_BASE_URL.
  // N8N_WEBHOOK_BASE_URL is what's actually set in the project, so we use that name here.
  if (decision === "approved") {
    const base = (process.env.N8N_WEBHOOK_BASE_URL ?? "").replace(/\/$/, "");
    const webhookUrl = `${base}/webhook/approve`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET ?? "",
        },
        body: JSON.stringify({
          action_id,
          decision,
          contractor_id: profile.contractor_id,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Timeout or network error — Supabase is already updated, contractor is unblocked
    }
  }

  return NextResponse.json({ success: true });
}
