"use client";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero */}
      <section style={{ background: "#1A2535", padding: "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 72px)" }}>
        <div style={{ maxWidth: "640px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>
            For HVAC contractors with 5–20 techs
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.15, marginBottom: "20px" }}>
            <span style={{ color: "#E8934A" }}>AI Operations for HVAC.</span> Set it and forget it.
          </h1>
          <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.7, maxWidth: "520px", marginBottom: "32px" }}>
            We build AI systems that plug into Jobber, ServiceTitan, or HouseCall Pro and handle lead response, schedule recovery, and admin work — 24/7. You don&apos;t touch the technology. We build it, run it, and keep it current.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => scrollTo("book-call")}
              style={{ fontSize: "14px", fontWeight: 500, background: "#E8934A", color: "#fff", border: "none", padding: "13px 28px", borderRadius: "6px", cursor: "pointer" }}
            >
              Book a discovery call
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              style={{ fontSize: "13px", color: "#9AAABB", background: "none", border: "none", cursor: "pointer" }}
            >
              See how it works →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#566677", marginTop: "16px" }}>
            30-minute call. No sales pitch. We map your workflow and tell you if we&apos;re a fit.
          </p>
        </div>
      </section>

      {/* Stat bar */}
      <section style={{ background: "#111E2E", padding: "20px clamp(20px, 5vw, 72px)", display: "flex", gap: "32px", flexWrap: "wrap" }}>
        {[
          { n: "< 60 sec", l: "We text back every missed call. Most contractors don't respond for 47+ hours." },
          { n: "13/mo", l: "Average missed calls for a 10-tech contractor. Every one is revenue walking out the door." },
          { n: "Zero", l: "New software for your team to learn. It runs on top of what you already have." },
        ].map(({ n, l }) => (
          <div key={n} style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#E8934A" }}>{n}</div>
            <div style={{ fontSize: "12px", color: "#6A7D8E", marginTop: "4px", lineHeight: 1.5 }}>{l}</div>
          </div>
        ))}
      </section>
    </>
  );
}
