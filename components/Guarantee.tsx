"use client";

export default function Guarantee() {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{ padding: "0 32px 40px", background: "var(--bg-primary)" }}>
      <div style={{ background: "#F5F2EE", border: "0.5px solid #DDD0C0", borderRadius: "10px", padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1A2535", marginBottom: "6px" }}>
          Try it free for 30 days. We do all the work.
        </h2>
        <p style={{ fontSize: "13px", color: "#5A6470", lineHeight: 1.6, marginBottom: "16px" }}>
          We need to get you at least 5 new leads and fill 2 open jobs in your first 30 days. If we don&apos;t, your first month is on us. We connect to your software. We handle the setup. You don&apos;t touch a thing.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          {["Plugs into Jobber", "Plugs into ServiceTitan", "Plugs into HouseCall Pro", "No contracts"].map((item) => (
            <span key={item} style={{ fontSize: "13px", color: "#1A7A4A", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 500 }}>✓</span> {item}
            </span>
          ))}
        </div>
        <button
          onClick={scrollToForm}
          style={{ fontSize: "14px", background: "#E8934A", color: "#fff", border: "none", padding: "11px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
        >
          Start my free 30-day trial
        </button>
      </div>
    </section>
  );
}
