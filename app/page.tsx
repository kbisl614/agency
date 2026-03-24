"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    industry: "",
    monthly_calls_missed: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── NAV ── */}
      <header style={{ background: "var(--bg-primary)", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px" }}>
          <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            Workfloor
          </span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button
              style={{ fontSize: "13px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              How it works
            </button>
            <button
              style={{ fontSize: "13px", background: "#C05C1E", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer" }}
              onClick={() => document.getElementById("book-call")?.scrollIntoView({ behavior: "smooth" })}
            >
              Book a call
            </button>
          </div>
        </nav>
      </header>

      <main>

        {/* ── HERO ── */}
        <section style={{ background: "#1A2535", padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 72px)" }}>
          <div style={{ display: "flex", gap: "clamp(40px, 6vw, 72px)", alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Left: headline + copy */}
            <div style={{ flex: "1 1 340px", maxWidth: "560px" }}>
              <p style={{ fontSize: "12px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>
                For HVAC contractors with 5–20 techs
              </p>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.15, marginBottom: "24px" }}>
                <span style={{ color: "#E8934A" }}>AI Operations for HVAC.</span> Set it and forget it.
              </h1>
              <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.75, marginBottom: "32px" }}>
                We map where your business is leaking money, build the AI that plugs the holes, and run it.
                Discovery call first. Custom-built for your operation. You see results every morning — you never touch a setting.
              </p>
              <button
                style={{ fontSize: "13px", color: "#9AAABB", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works →
              </button>
            </div>

            {/* Right: compact booking form */}
            <div style={{ flex: "1 1 320px", maxWidth: "420px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #E8934A", borderRadius: "10px", padding: "28px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#F5F3EE", marginBottom: "4px" }}>Book a discovery call</p>
                <p style={{ fontSize: "12px", color: "#6A7D8E", marginBottom: "20px", lineHeight: 1.5 }}>30 minutes. We map your operation and tell you honestly if we're a fit.</p>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: "24px", marginBottom: "10px" }}>✓</div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#F5F3EE", marginBottom: "6px" }}>You're on the calendar.</p>
                    <p style={{ fontSize: "13px", color: "#6A7D8E" }}>We'll confirm your time by end of day.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <input
                      type="text"
                      placeholder="Business name"
                      className="input-field"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Your name"
                      className="input-field"
                      required
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <input
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="input-field"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <select
                      className="input-field"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Scheduling software</option>
                      <option value="Jobber">Jobber</option>
                      <option value="ServiceTitan">ServiceTitan</option>
                      <option value="HouseCall Pro">HouseCall Pro</option>
                      <option value="Other / not sure">Other / not sure</option>
                    </select>
                    {error && <p style={{ fontSize: "12px", color: "#E85A4A" }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ width: "100%", padding: "13px", background: isSubmitting ? "#C05C1E" : "#E8934A", color: "#fff", border: "none", borderRadius: "6px", cursor: isSubmitting ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600 }}
                    >
                      {isSubmitting ? "Sending..." : "Book my discovery call"}
                    </button>
                    <p style={{ textAlign: "center", fontSize: "11px", color: "#566677" }}>No contracts. No pressure.</p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ── STATS ROW ── */}
        <section style={{ background: "#111E2E", padding: "clamp(48px, 6vw, 64px) clamp(20px, 5vw, 72px)", display: "flex", gap: "48px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#E8934A" }}>&lt; 60 sec</div>
            <div style={{ fontSize: "13px", color: "#6A7D8E", marginTop: "6px", lineHeight: 1.6 }}>
              We respond to every missed contact. Most contractors don't respond for 47+ hours.
            </div>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#E8934A" }}>$3,900/mo</div>
            <div style={{ fontSize: "13px", color: "#6A7D8E", marginTop: "6px", lineHeight: 1.6 }}>
              Average monthly revenue lost to missed calls alone. Every one logged, responded to, recovered.
            </div>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#E8934A" }}>No migration</div>
            <div style={{ fontSize: "13px", color: "#6A7D8E", marginTop: "6px", lineHeight: 1.6 }}>
              Connects with your existing CRM, whatever it is. Your crew never touches it.
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 72px)", background: "var(--bg-primary)" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px", textAlign: "center" }}>
            Three steps.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "40px", textAlign: "center" }}>
            Most contractors are live within a week of their discovery call.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>

            {/* Step 1 */}
            <div style={{ background: "#fff", border: "0.5px solid var(--border-subtle)", borderRadius: "10px", padding: "32px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#E8934A", letterSpacing: "1px", marginBottom: "14px" }}>01</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>
                We map your bottlenecks.
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                30-minute call. We look at where calls and jobs are slipping — which leads go unanswered,
                which slots go unfilled, which tasks eat your dispatcher's day. We tell you exactly what
                we'd build and what it would recover. If we're not the right fit, we say that too.
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: "#fff", border: "0.5px solid var(--border-subtle)", borderRadius: "10px", padding: "32px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#E8934A", letterSpacing: "1px", marginBottom: "14px" }}>02</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>
                We build it.
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                We connect to your existing CRM — whatever you're already using — and configure everything
                to your business. Your service area, your pricing, how you talk to customers. End-to-end
                tested before anything goes live. You don't touch a single setting.
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: "#fff", border: "0.5px solid var(--border-subtle)", borderRadius: "10px", padding: "32px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#E8934A", letterSpacing: "1px", marginBottom: "14px" }}>03</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>
                It gets smarter. You never fall behind.
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                The system learns from your business over time and improves. As AI tools evolve, we update
                and upgrade what's running for you automatically. You're never managing software updates or
                researching what's new — that's our job.
              </div>
            </div>

          </div>
        </section>

        {/* ── WHAT'S INCLUDED ── */}
        <section style={{ padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 72px)", background: "#1A2535" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>
            What's included
          </p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 500, color: "#F5F3EE", marginBottom: "12px" }}>
            Everything that runs after we build it.
          </h2>
          <p style={{ fontSize: "14px", color: "#6A7D8E", lineHeight: 1.65, marginBottom: "40px", maxWidth: "520px" }}>
            The AI we implement isn't a product you buy — it's a custom system we build into your business,
            manage on your behalf, and grow alongside you.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "20px" }}>
            {[
              {
                title: "Built specifically for your operation",
                body: "Every AI solution we implement is scoped to how your business actually runs — your jobs, your customers, your workflow. No templates. No packages. No two implementations are the same.",
              },
              {
                title: "It documents what it learns",
                body: "The AI continuously tracks patterns in your business — what's working, when leads come in, how customers respond. That knowledge is logged and used to make every next decision sharper.",
              },
              {
                title: "It improves autonomously — and we tune it alongside that",
                body: "The system improves on its own as it accumulates data. We actively manage and tune it on top of that — monitoring performance, adjusting behavior, and pushing updates. You get both: a self-improving system and a team watching it.",
              },
              {
                title: "It scales as your business scales",
                body: "More techs, more jobs, more complexity — the system handles it without needing to be rebuilt. As your operation grows, we expand what the AI covers to match.",
              },
              {
                title: "Every decision is logged and visible",
                body: "You always know what the AI did, when it did it, and why. Full transparency on every action — so you can trust what's running and we can show you exactly what it's recovering.",
              },
              {
                title: "We keep you current as AI evolves",
                body: "When better tools and capabilities emerge, we integrate them into your system. You never have to research what's new in AI or worry about falling behind — that's what we're here for.",
              },
              {
                title: "You see what's happening every morning",
                body: "A plain-English summary hits your phone by 7am — what ran overnight, what was recovered, what's on deck. No reports to pull. Just a clear picture of what your AI did while you slept.",
              },
              {
                title: "High-stakes actions always need your approval",
                body: "The system handles the routine automatically, but anything outside normal bounds stops and waits for you. You stay in control of the decisions that matter — without having to manage the ones that don't.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "10px",
                  padding: "32px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                  <span style={{ color: "#E8934A", fontSize: "14px", marginTop: "2px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.4 }}>
                    {item.title}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#6A7D8E", lineHeight: 1.7, margin: "0 0 0 26px" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT TO EXPECT (replaces guarantee) ── */}
        <section style={{ padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 72px)", background: "var(--bg-primary)" }}>
          <div style={{ background: "#F5F2EE", border: "1.5px solid #E8934A", borderRadius: "10px", padding: "clamp(28px, 4vw, 48px)", maxWidth: "660px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>
              How it works for you
            </p>
            <h2 style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 500, color: "#1A2535", marginBottom: "24px", lineHeight: 1.35 }}>
              No contracts until we've proven the fit.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {[
                "Discovery call first. We map your operation and tell you honestly what we'd build and what it would recover.",
                "Custom-built in about a week. Everything configured to your business before anything goes live.",
                "We scope the engagement on the call. If what we'd build makes sense for your operation, we'll outline terms and move forward together.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1A7A4A", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  <span style={{ fontSize: "14px", color: "#5A6470", lineHeight: 1.7 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
              {["Works with any CRM", "Custom-built for your operation", "No generic packages"].map((badge) => (
                <span key={badge} style={{ fontSize: "13px", color: "#1A7A4A", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 600 }}>✓</span> {badge}
                </span>
              ))}
            </div>
            <button
              style={{ fontSize: "14px", background: "#E8934A", color: "#fff", border: "none", padding: "13px 28px", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
              onClick={() => document.getElementById("book-call")?.scrollIntoView({ behavior: "smooth" })}
            >
              Book a discovery call
            </button>
          </div>
        </section>

        {/* ── PRICING CONTEXT ── */}
        <section style={{ padding: "clamp(64px, 8vw, 96px) clamp(20px, 5vw, 72px)", background: "#1A2535" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>
            What does it cost
          </p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 500, color: "#F5F3EE", marginBottom: "16px" }}>
            Scoped on the call. Transparent before you pay.
          </h2>
          <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.8, maxWidth: "560px", marginBottom: "12px" }}>
            Engagements start at $1,500/month depending on scope. Some contractors need one agent.
            Some need four. We scope everything on the discovery call and send a proposal within 24 hours —
            you know exactly what you're getting before any money changes hands.
          </p>
          <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.8, maxWidth: "560px" }}>
            Setup fee starts at $500 and scales with scope. No generic packages. No pressure —
            just a clear proposal and a straightforward decision.
          </p>
        </section>

        {/* ── FORM ── */}
        <section id="book-call" style={{ background: "var(--bg-primary)", padding: "clamp(72px, 10vw, 112px) clamp(20px, 5vw, 72px)" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-500)", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "14px" }}>
                Book a discovery call
              </p>
              <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.25 }}>
                Let's talk. 30 minutes.
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                We'll map your operation, identify where AI makes the most sense for your business,
                and walk you through exactly what we'd build. You'll leave with a clear picture of what's possible.
              </p>
            </div>

            {submitted ? (
              <div style={{ background: "#F0FAF4", border: "0.5px solid #1A7A4A", borderRadius: "10px", padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>✓</div>
                <h3 style={{ fontSize: "17px", fontWeight: 500, color: "#1A2535", marginBottom: "8px" }}>You're on the calendar.</h3>
                <p style={{ fontSize: "14px", color: "#5A6470", lineHeight: 1.65 }}>
                  We'll confirm your time by end of day. Talk soon.
                </p>
              </div>
            ) : (
              <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "clamp(24px, 4vw, 40px)", border: "1.5px solid #E8934A" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "7px" }}>
                      Business name <span style={{ color: "#E85A4A" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Smith's HVAC & Plumbing"
                      className="input-field"
                      name="business_name"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "7px" }}>
                      Your name <span style={{ color: "#E85A4A" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      className="input-field"
                      name="owner_name"
                      required
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "7px" }}>
                        Email <span style={{ color: "#E85A4A" }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="input-field"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "7px" }}>
                        Phone <span style={{ color: "#E85A4A" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="input-field"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                      What scheduling software do you use? <span style={{ color: "#E85A4A" }}>*</span>
                    </label>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "7px", marginTop: "0" }}>
                      So we can confirm how we'd connect before we talk.
                    </p>
                    <select
                      className="input-field"
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select your software</option>
                      <option value="Jobber">Jobber</option>
                      <option value="ServiceTitan">ServiceTitan</option>
                      <option value="HouseCall Pro">HouseCall Pro</option>
                      <option value="Other / not sure">Other / not sure</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                      How many techs do you run?{" "}
                      <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "7px", marginTop: "0" }}>
                      Helps us size the right build for your operation.
                    </p>
                    <input
                      type="number"
                      placeholder="e.g., 8"
                      min="1"
                      className="input-field"
                      name="monthly_calls_missed"
                      value={formData.monthly_calls_missed}
                      onChange={(e) => setFormData({ ...formData, monthly_calls_missed: e.target.value })}
                    />
                  </div>

                  {error && (
                    <p style={{ fontSize: "13px", color: "#E85A4A", lineHeight: 1.5 }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: isSubmitting ? "#C05C1E" : "#E8934A",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "background 0.15s",
                    }}
                  >
                    {isSubmitting ? "Sending..." : "Book my discovery call"}
                  </button>

                  <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    We'll confirm your time by end of day. Just 30 minutes.
                  </p>

                </form>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111E2E", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#6A7D8E" }}>Workfloor · Cedar Rapids, IA</span>
        <span style={{ fontSize: "12px", color: "#6A7D8E" }}>AI operations for HVAC contractors</span>
      </footer>
    </>
  );
}
