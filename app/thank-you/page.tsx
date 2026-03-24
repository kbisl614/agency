import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're All Set | Workfloor",
  description: "We'll be in touch today to get everything connected and start your free trial.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <main style={{ background: "#1A2535", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        {/* Check icon */}
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1A7A4A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.2, marginBottom: "12px" }}>
          Got it. We&apos;ll call you today.
        </h1>
        <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.6, marginBottom: "32px" }}>
          Someone from our team will reach out within a few hours. We handle the setup — you don&apos;t need to do a thing.
        </p>

        {/* What happens next */}
        <div style={{ background: "#111E2E", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#E8934A", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            Here&apos;s what happens next
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              {
                num: "1",
                title: "We call you today",
                body: "Short call — about 20 minutes. We ask a few questions about your jobs and your software.",
              },
              {
                num: "2",
                title: "We connect everything",
                body: "We plug into Jobber, ServiceTitan, or HouseCall Pro. You don't touch a thing.",
              },
              {
                num: "3",
                title: "It starts running",
                body: "You get a morning report showing every missed call caught, every lead answered, every open slot filled.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} style={{ display: "flex", gap: "14px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E8934A", color: "#fff", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {num}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#F5F3EE", marginBottom: "4px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: "#6A7D8E", lineHeight: 1.5 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div style={{ background: "#1F3044", borderRadius: "8px", padding: "16px", marginBottom: "28px" }}>
          <p style={{ fontSize: "13px", color: "#9AAABB", lineHeight: 1.6 }}>
            If we don&apos;t get you at least <strong style={{ color: "#F5F3EE" }}>5 new leads</strong> and fill <strong style={{ color: "#F5F3EE" }}>2 open jobs</strong> in the first 30 days, your first month is free. No questions asked.
          </p>
        </div>

        <Link
          href="/"
          style={{ fontSize: "13px", color: "#E8934A", textDecoration: "none" }}
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
