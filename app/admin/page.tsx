import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify admin role (admin client bypasses RLS — user already authenticated above)
  const { data: profile } = await supabaseAdmin!
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: clients } = await supabaseAdmin!
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const activeClients = (clients ?? []).filter((c: Client) => c.is_active);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1A2535", fontFamily: "system-ui, sans-serif" }}>
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
        <span style={{ color: "#FAFAF8", fontWeight: 700, fontSize: "16px" }}>Fieldline AI — Admin</span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/admin/onboard"
            style={{
              backgroundColor: "#E8934A",
              color: "#FAFAF8",
              padding: "7px 16px",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            + Onboard Client
          </Link>
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
        </div>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Total Clients" value={String(clients?.length ?? 0)} />
          <StatCard label="Active Clients" value={String(activeClients.length)} />
          <StatCard
            label="Agents Deployed"
            value={String(
              activeClients.reduce((sum: number, c: Client) => {
                const a = c.agents_active ?? {};
                return sum + Object.values(a).filter(Boolean).length;
              }, 0)
            )}
          />
        </div>

        <h2 style={{ color: "#FAFAF8", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
          All Clients
        </h2>

        {!clients || clients.length === 0 ? (
          <div
            style={{
              backgroundColor: "#0F1923",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#6B7280", fontSize: "15px", marginBottom: "16px" }}>
              No clients yet.
            </p>
            <Link
              href="/admin/onboard"
              style={{
                color: "#E8934A",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Onboard your first client →
            </Link>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#0F1923",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1.5fr 80px",
                padding: "12px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                gap: "12px",
              }}
            >
              {["Business", "Owner", "CRM", "Agents Active", "Status"].map((h) => (
                <span
                  key={h}
                  style={{
                    color: "#6B7280",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {(clients as Client[]).map((client, i) => {
              const agents = client.agents_active ?? {};
              const activeAgentNames = Object.entries(agents)
                .filter(([, v]) => v)
                .map(([k]) => k);

              return (
                <div
                  key={client.contractor_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1.5fr 80px",
                    padding: "16px 20px",
                    gap: "12px",
                    borderBottom:
                      i < clients.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#FAFAF8", fontSize: "14px", fontWeight: 600 }}>
                    {client.business_name}
                  </span>
                  <span style={{ color: "#9CA3AF", fontSize: "13px" }}>{client.owner_email}</span>
                  <span
                    style={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {client.crm_type}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {activeAgentNames.length === 0 ? (
                      <span style={{ color: "#4B5563", fontSize: "12px" }}>None</span>
                    ) : (
                      activeAgentNames.map((name) => (
                        <span
                          key={name}
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "20px",
                            backgroundColor: "rgba(232,147,74,0.15)",
                            color: "#E8934A",
                            textTransform: "capitalize",
                          }}
                        >
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "20px",
                      backgroundColor: client.is_active
                        ? "rgba(26,122,74,0.2)"
                        : "rgba(255,255,255,0.06)",
                      color: client.is_active ? "#1A7A4A" : "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    {client.is_active ? "LIVE" : "OFF"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        backgroundColor: "#0F1923",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px 24px",
      }}
    >
      <p style={{ color: "#6B7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ color: "#FAFAF8", fontSize: "32px", fontWeight: 800, margin: 0 }}>{value}</p>
    </div>
  );
}
