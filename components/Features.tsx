const steps = [
  {
    num: "01",
    title: "We map your bottlenecks",
    body: "30-minute call. We look at where calls and jobs are slipping through, what software you're on, and what your crew's day actually looks like. We tell you up front if we're a fit.",
  },
  {
    num: "02",
    title: "We build it in about a week",
    body: "We connect to your CRM and configure everything around your business — your schedule, your service area, the way you talk to customers. You don't touch a single setting.",
  },
  {
    num: "03",
    title: "It runs. We keep it current.",
    body: "Missed calls get answered. Open slots fill. Admin takes care of itself. Monthly retainer means we're watching it, fixing it, and rolling out new capabilities as AI improves — so you never have to think about it.",
  },
];

const deliverables = [
  "Every missed call gets a text back in under 60 seconds",
  "Late-night leads handled — job booked before you wake up",
  "Open slots fill automatically from your waitlist",
  "Invoice follow-ups and payment reminders sent automatically",
  "Post-job review requests within 24 hours",
  "7am daily summary — plain English, what ran overnight",
  "High-stakes actions need your approval before anything executes",
  "Monthly upgrades as AI tools evolve — no extra charge",
];

export default function Features() {
  return (
    <>
      {/* How it works */}
      <section id="how-it-works" style={{ padding: "clamp(40px, 6vw, 64px) clamp(20px, 5vw, 72px)", background: "var(--bg-primary)" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "10px" }}>
          How it works
        </p>
        <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
          Three steps, then it runs itself.
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px", maxWidth: "440px" }}>
          Most contractors are up and running within a week of their discovery call.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {steps.map((s) => (
            <div key={s.num} style={{ background: "#fff", border: "0.5px solid var(--border-subtle)", borderRadius: "10px", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#E8934A", letterSpacing: "1px", marginBottom: "12px" }}>{s.num}</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>{s.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 5vw, 72px)", background: "#1A2535" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "10px" }}>
          What&apos;s included
        </p>
        <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 500, color: "#F5F3EE", marginBottom: "28px" }}>
          Everything that runs after we build it.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
          {deliverables.map((d) => (
            <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: "#E8934A", fontSize: "14px", marginTop: "1px", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "13px", color: "#9AAABB", lineHeight: 1.6 }}>{d}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#566677", marginTop: "24px" }}>
          Not a fit for every business. If you&apos;re running 1–4 techs or don&apos;t use scheduling software yet, we&apos;ll tell you that on the call.
        </p>
      </section>
    </>
  );
}
