const features = [
  {
    svg: (
      <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", stroke: "#E8934A", fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const }}>
        <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    title: "You miss a call. We text them back.",
    body: "We reply in 60 seconds: \"We're on a job — what's wrong with your system?\" Most people answer. Most book.",
    roi: "$3,900/mo back in your pocket",
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", stroke: "#E8934A", fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const }}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Late-night calls handled.",
    body: "Someone calls at 10pm. We reply in under 30 seconds. You wake up to a booked job — not a voicemail you have to chase down.",
    roi: "$1,500/mo back in your pocket",
  },
  {
    svg: (
      <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", stroke: "#E8934A", fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const }}>
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Open slot? It fills itself.",
    body: "A job cancels. We text your waiting customers right away. Most open slots fill in under 15 minutes. You don't make a single call.",
    roi: "$700/mo back in your pocket",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "40px 32px", background: "var(--bg-secondary)" }}>
      <div style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "8px" }}>
        How it works
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
        Three ways we put money back in your pocket
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px", maxWidth: "480px" }}>
        You get a morning report showing everything that came in overnight.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {features.map((f) => (
          <div key={f.title} style={{ background: "var(--bg-secondary)", border: "0.5px solid var(--border-subtle)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#1A2535", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              {f.svg}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>{f.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.body}</div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#E8934A", marginTop: "10px" }}>{f.roi}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
