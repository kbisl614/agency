import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client, DashboardLead, Action } from "@/lib/supabase";

const AGENT_LABELS: Record<string, string> = {
  concierge: "The Concierge",
  closer: "The Closer",
  dispatcher: "The Dispatcher",
  strategist: "The Strategist",
};

const AGENT_DESCRIPTIONS: Record<string, string> = {
  concierge: "24/7 lead intake, after-hours response, review requests",
  closer: "Proposal generation from diagnostics",
  dispatcher: "Schedule optimization, cancellation fill, ETA updates",
  strategist: "Customer reactivation, block specials, monthly ROI reports",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load this user's profile using admin client (bypasses RLS — user already authenticated above)
  const { data: profile } = await supabaseAdmin!
    .from("users")
    .select("contractor_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <ErrorState message="Account not configured. Contact support." />;
  }

  // Admins go to /admin, not the client dashboard
  if (profile.role === "admin") redirect("/admin");

  const contractorId = profile.contractor_id;

  // Load client record, leads, and actions in parallel
  const [{ data: client }, { data: leads }, { data: actions }] = await Promise.all([
    supabase.from("clients").select("*").eq("contractor_id", contractorId).single(),
    supabase
      .from("leads")
      .select("*")
      .eq("contractor_id", contractorId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("actions")
      .select("*")
      .eq("contractor_id", contractorId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (!client) {
    return <ErrorState message="Client record not found. Contact support." />;
  }

  // Guarantee tracker: leads this calendar month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const leadsThisMonth = (leads ?? []).filter(
    (l) => new Date(l.created_at) >= monthStart
  ).length;

  const agentsActive = client.agents_active ?? {};

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1A2535", fontFamily: "system-ui, sans-serif" }}>
      {/* Top nav */}
      <nav
        style={{
          backgroundColor: "#0F1923",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#E8934A",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#FAFAF8", fontWeight: 700, fontSize: "15px" }}>F</span>
          </div>
          <span style={{ color: "#FAFAF8", fontWeight: 700, fontSize: "16px" }}>Fieldline AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#9CA3AF", fontSize: "14px" }}>{client.business_name}</span>
          <LogoutButton />
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ color: "#FAFAF8", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Your Digital Front Office
        </h1>
        <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "32px" }}>
          Everything your AI agents are doing, in real time.
        </p>

        {/* Active agents */}
        <Section title="Active Agents">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {Object.entries(agentsActive).map(([key, active]) => (
              <AgentCard
                key={key}
                name={AGENT_LABELS[key] ?? key}
                description={AGENT_DESCRIPTIONS[key] ?? ""}
                active={Boolean(active)}
              />
            ))}
          </div>
        </Section>

        {/* Guarantee tracker + leads recovered side by side */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "24px" }}>
          {/* Guarantee tracker */}
          <div
            style={{
              flex: "1 1 280px",
              backgroundColor: "#0F1923",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h2 style={{ color: "#FAFAF8", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
              Guarantee Tracker
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "20px" }}>
              Leads recovered this month
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
              <span style={{ color: "#E8934A", fontSize: "48px", fontWeight: 800 }}>
                {leadsThisMonth}
              </span>
              <span style={{ color: "#9CA3AF", fontSize: "20px" }}>/ 5</span>
            </div>
            <div
              style={{
                height: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (leadsThisMonth / 5) * 100)}%`,
                  backgroundColor: leadsThisMonth >= 5 ? "#1A7A4A" : "#E8934A",
                  borderRadius: "4px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            {leadsThisMonth >= 5 && (
              <p style={{ color: "#1A7A4A", fontSize: "13px", marginTop: "12px", fontWeight: 600 }}>
                ✓ Guarantee met this month
              </p>
            )}
          </div>

          {/* Recent leads */}
          <div
            style={{
              flex: "1 1 400px",
              backgroundColor: "#0F1923",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h2 style={{ color: "#FAFAF8", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
              Leads Recovered
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "20px" }}>
              Most recent first
            </p>
            {!leads || leads.length === 0 ? (
              <EmptyState message="No leads yet — the Concierge is standing by." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(leads as DashboardLead[]).slice(0, 8).map((lead) => (
                  <LeadRow key={lead.lead_id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions feed */}
        <Section title="Actions Feed" subtitle="Everything your agents have done" style={{ marginTop: "24px" }}>
          {!actions || actions.length === 0 ? (
            <EmptyState message="No actions yet — agents will log activity here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(actions as Action[]).map((action) => (
                <ActionRow key={action.action_id} action={action} />
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <h2 style={{ color: "#FAFAF8", fontSize: "16px", fontWeight: 700, marginBottom: subtitle ? "4px" : "16px" }}>
        {title}
      </h2>
      {subtitle && <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "16px" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function AgentCard({ name, description, active }: { name: string; description: string; active: boolean }) {
  return (
    <div
      style={{
        flex: "1 1 220px",
        backgroundColor: "#0F1923",
        border: `1px solid ${active ? "rgba(26,122,74,0.5)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "12px",
        padding: "20px",
        opacity: active ? 1 : 0.45,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ color: "#FAFAF8", fontWeight: 700, fontSize: "14px" }}>{name}</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "20px",
            backgroundColor: active ? "rgba(26,122,74,0.2)" : "rgba(255,255,255,0.06)",
            color: active ? "#1A7A4A" : "#6B7280",
          }}
        >
          {active ? "LIVE" : "INACTIVE"}
        </span>
      </div>
      <p style={{ color: "#9CA3AF", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

function LeadRow({ lead }: { lead: DashboardLead }) {
  const date = new Date(lead.created_at);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div>
        <p style={{ color: "#FAFAF8", fontSize: "14px", fontWeight: 600, margin: "0 0 2px" }}>
          {lead.customer_name}
        </p>
        <p style={{ color: "#9CA3AF", fontSize: "12px", margin: 0 }}>
          {lead.service_type ?? "General inquiry"} · {lead.phone}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "20px",
            backgroundColor:
              lead.status === "booked"
                ? "rgba(26,122,74,0.2)"
                : lead.status === "contacted"
                ? "rgba(232,147,74,0.2)"
                : "rgba(255,255,255,0.08)",
            color:
              lead.status === "booked"
                ? "#1A7A4A"
                : lead.status === "contacted"
                ? "#E8934A"
                : "#9CA3AF",
          }}
        >
          {lead.status.toUpperCase()}
        </span>
        <p style={{ color: "#6B7280", fontSize: "11px", margin: "4px 0 0", whiteSpace: "nowrap" }}>
          {dateStr} {timeStr}
        </p>
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: Action }) {
  const date = new Date(action.created_at);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "14px 16px",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: "8px",
        gap: "16px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "20px",
              backgroundColor: "rgba(232,147,74,0.15)",
              color: "#E8934A",
              textTransform: "uppercase",
            }}
          >
            {action.agent_name}
          </span>
          {action.revenue_impact != null && action.revenue_impact > 0 && (
            <span style={{ color: "#1A7A4A", fontSize: "12px", fontWeight: 600 }}>
              +${action.revenue_impact.toLocaleString()}
            </span>
          )}
        </div>
        <p style={{ color: "#D1D5DB", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
          {action.description}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ color: "#6B7280", fontSize: "11px", margin: 0, whiteSpace: "nowrap" }}>
          {dateStr} {timeStr}
        </p>
        {!action.success && (
          <p style={{ color: "#EF4444", fontSize: "11px", margin: "4px 0 0" }}>failed</p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p style={{ color: "#6B7280", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
      {message}
    </p>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1A2535",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "#EF4444", fontSize: "15px" }}>{message}</p>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        style={{
          background: "none",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#9CA3AF",
          padding: "6px 14px",
          borderRadius: "6px",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </form>
  );
}
