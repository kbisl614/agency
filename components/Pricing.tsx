"use client";

const plans = [
  {
    name: "Get Started",
    price: "$1,500",
    description: "The basics, up and running fast. Good for most contractors.",
    features: [
      "We text back every missed call in 60 seconds",
      "Handles calls and leads after hours",
      "Fills open slots when jobs cancel",
      "Morning report — see exactly what came in",
      "We handle setup. You don't touch a thing.",
      "Plugs into Jobber, ServiceTitan, or HouseCall Pro",
      "No contracts. Quit anytime.",
      "Free for the first 30 days",
    ],
    cta: "Try it free",
    popular: true,
  },
  {
    name: "Built for You",
    price: "$2,000",
    description: "We learn how you run your jobs and set it up around your business.",
    features: [
      "Everything in Get Started",
      "We study how your jobs and calls work first",
      "Messages that sound like they came from your office",
      "Set up around your schedule and your team",
      "Dedicated setup call — we walk you through it",
      "No contracts. Quit anytime.",
      "Free for the first 30 days",
    ],
    cta: "Try it free",
    popular: false,
  },
  {
    name: "Done For You",
    price: "$3,000",
    description: "We build everything top to bottom, just for your business.",
    features: [
      "Everything in Built for You",
      "We dig deep into how your business works",
      "Built specifically for you, start to finish",
      "Faster setup — you're a priority",
      "We tune it every month based on results",
      "No contracts. Quit anytime.",
      "Free for the first 30 days",
    ],
    cta: "Let's talk",
    popular: false,
  },
];

export default function Pricing() {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" style={{ padding: "40px 32px", background: "var(--bg-primary)" }}>
      <div style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "8px" }}>
        What it costs
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
        Simple pricing. No contracts. No surprises.
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "480px" }}>
        Try it free for 30 days. If it doesn&apos;t work, you don&apos;t pay.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", maxWidth: "900px" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              background: "var(--bg-secondary)",
              border: plan.popular ? "1.5px solid #E8934A" : "0.5px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "24px",
              position: "relative",
            }}
          >
            {plan.popular && (
              <div style={{ position: "absolute", top: "-12px", left: "20px", background: "#E8934A", color: "#fff", fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "4px" }}>
                Most popular
              </div>
            )}
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>{plan.name}</div>
            <div style={{ fontSize: "28px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
              {plan.price}<span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 400 }}>/mo</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>{plan.description}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {plan.features.map((f) => (
                <div key={f} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#1A7A4A", fontWeight: 500, flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToForm}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: plan.popular ? "#E8934A" : "#F0EBE3",
                color: plan.popular ? "#fff" : "#1A2535",
              }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "20px" }}>
        A full-time dispatcher costs $38k–$55k a year. Ten recovered calls a month covers $1,500/mo on its own.
      </p>
    </section>
  );
}
