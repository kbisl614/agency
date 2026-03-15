"use client";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero */}
      <section style={{ background: "#1A2535", padding: "56px 32px 48px" }}>
        <div style={{ maxWidth: "580px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
            For HVAC contractors
          </p>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.2, marginBottom: "16px" }}>
            You&apos;re losing <span style={{ color: "#E8934A" }}>$3,900/month</span> to missed calls. We get it back.
          </h1>
          <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.6, maxWidth: "480px", marginBottom: "28px" }}>
            Plugs into Jobber, ServiceTitan, or HouseCall Pro. No new software to learn. We connect it, set it up, and it runs. You just keep doing your jobs.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => scrollTo("lead-form")}
              style={{ fontSize: "14px", background: "#E8934A", color: "#fff", border: "none", padding: "11px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
            >
              Try it free for 30 days
            </button>
            <button
              onClick={() => scrollTo("features")}
              style={{ fontSize: "13px", color: "#9AAABB", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              See how it works →
            </button>
          </div>
        </div>
      </section>

      {/* Stat bar */}
      <section style={{ background: "#111E2E", padding: "20px 32px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
        {[
          { n: "30 sec", l: "We text back missed calls. Most competitors take 47 hours." },
          { n: "$8,600", l: "Extra money per month for the average contractor we work with." },
          { n: "Zero", l: "New software to learn. It runs on top of what you already have." },
        ].map(({ n, l }) => (
          <div key={n} style={{ flex: 1, minWidth: "140px" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#E8934A" }}>{n}</div>
            <div style={{ fontSize: "12px", color: "#6A7D8E", marginTop: "2px", lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </section>
    </>
  );
}
