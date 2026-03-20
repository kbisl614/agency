"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardFormData {
  business_name: string;
  owner_email: string;
  owner_phone: string;
  crm_type: "jobber" | "servicetitan" | "housecallpro" | "other";
  review_link: string;
  jobber_api_key: string;
  // Agents to activate
  concierge: boolean;
  closer: boolean;
  dispatcher: boolean;
  strategist: boolean;
}

const EMPTY_FORM: OnboardFormData = {
  business_name: "",
  owner_email: "",
  owner_phone: "",
  crm_type: "jobber",
  review_link: "",
  jobber_api_key: "",
  concierge: true,
  closer: false,
  dispatcher: false,
  strategist: false,
};

export default function OnboardPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof OnboardFormData>(key: K, value: OnboardFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch("/api/admin/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess(`✓ ${form.business_name} is onboarded. Temp password: ${data.tempPassword}`);
    setForm(EMPTY_FORM);
    setLoading(false);
  }

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
        <button
          onClick={() => router.push("/admin")}
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
          ← All clients
        </button>
      </nav>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ color: "#FAFAF8", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          Onboard New Client
        </h1>
        <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "32px" }}>
          Creates the client record and Supabase Auth account. Send them the temp password on your go-live call.
        </p>

        {success && (
          <div
            style={{
              backgroundColor: "rgba(26,122,74,0.15)",
              border: "1px solid rgba(26,122,74,0.4)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px",
              color: "#1A7A4A",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px",
              color: "#EF4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#0F1923",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Field label="Business Name" required>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => set("business_name", e.target.value)}
              required
              style={inputStyle}
              placeholder="Smith HVAC"
            />
          </Field>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <Field label="Owner Email" required style={{ flex: "1 1 200px" }}>
              <input
                type="email"
                value={form.owner_email}
                onChange={(e) => set("owner_email", e.target.value)}
                required
                style={inputStyle}
                placeholder="owner@smithhvac.com"
              />
            </Field>
            <Field label="Owner Phone" required style={{ flex: "1 1 160px" }}>
              <input
                type="tel"
                value={form.owner_phone}
                onChange={(e) => set("owner_phone", e.target.value)}
                required
                style={inputStyle}
                placeholder="(555) 000-0000"
              />
            </Field>
          </div>

          <Field label="CRM / Field Service Software" required>
            <select
              value={form.crm_type}
              onChange={(e) => set("crm_type", e.target.value as OnboardFormData["crm_type"])}
              style={inputStyle}
            >
              <option value="jobber">Jobber</option>
              <option value="servicetitan">ServiceTitan</option>
              <option value="housecallpro">HouseCall Pro</option>
              <option value="other">Other / None</option>
            </select>
          </Field>

          {form.crm_type === "jobber" && (
            <Field label="Jobber API Key">
              <input
                type="text"
                value={form.jobber_api_key}
                onChange={(e) => set("jobber_api_key", e.target.value)}
                style={inputStyle}
                placeholder="jobber_..."
              />
            </Field>
          )}

          <Field label="Google Review Link">
            <input
              type="url"
              value={form.review_link}
              onChange={(e) => set("review_link", e.target.value)}
              style={inputStyle}
              placeholder="https://g.page/r/..."
            />
          </Field>

          {/* Active agents */}
          <div>
            <p
              style={{
                color: "#9CA3AF",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              Agents to Activate
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {(["concierge", "closer", "dispatcher", "strategist"] as const).map((agent) => (
                <label
                  key={agent}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    backgroundColor: form[agent]
                      ? "rgba(232,147,74,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form[agent] ? "rgba(232,147,74,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: form[agent] ? "#E8934A" : "#6B7280",
                    fontSize: "13px",
                    fontWeight: 600,
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form[agent]}
                    onChange={(e) => set(agent, e.target.checked)}
                    style={{ display: "none" }}
                  />
                  {agent.charAt(0).toUpperCase() + agent.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9CA3AF" : "#E8934A",
              color: "#FAFAF8",
              border: "none",
              borderRadius: "8px",
              padding: "13px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {loading ? "Creating account…" : "Onboard Client"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  style,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label
        style={{
          display: "block",
          color: "#D1D5DB",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "6px",
        }}
      >
        {label}
        {required && <span style={{ color: "#E8934A", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#FAFAF8",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
