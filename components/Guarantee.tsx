"use client";

export default function Guarantee() {
  const scrollToForm = () => {
    document.getElementById("book-call")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{ padding: "clamp(32px, 5vw, 56px) clamp(20px, 5vw, 72px)", background: "var(--bg-primary)" }}>
      <div style={{ background: "#F5F2EE", border: "0.5px solid #DDD0C0", borderRadius: "10px", padding: "clamp(20px, 4vw, 32px)", maxWidth: "640px" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "10px" }}>
          Our guarantee
        </p>
        <h2 style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 500, color: "#1A2535", marginBottom: "10px", lineHeight: 1.3 }}>
          5 recovered leads in your first 30 days — or your second month is free.
        </h2>
        <p style={{ fontSize: "13px", color: "#5A6470", lineHeight: 1.7, marginBottom: "20px" }}>
          We connect to your tools. We handle every piece of setup. If the system doesn&apos;t bring in at least 5 leads or fill 2 open slots in your first month, month two costs you nothing. That&apos;s how confident we are in what we build.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "22px" }}>
          {["Works with Jobber", "Works with ServiceTitan", "Works with HouseCall Pro", "No long-term contracts"].map((item) => (
            <span key={item} style={{ fontSize: "13px", color: "#1A7A4A", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 600 }}>✓</span> {item}
            </span>
          ))}
        </div>
        <button
          onClick={scrollToForm}
          style={{ fontSize: "14px", background: "#E8934A", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
        >
          Book a discovery call
        </button>
      </div>
    </section>
  );
}
