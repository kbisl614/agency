import Header from "@/components/Header";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Guarantee from "@/components/Guarantee";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export const metadata = {
  title: "For Jobber Users | Fieldline AI",
  description: "Fieldline AI works on top of Jobber to text back missed calls, fill cancellations, and capture after-hours leads. 30-day free trial.",
};

function JobberHero() {
  return (
    <>
      <section style={{ background: "#1A2535", padding: "56px 32px 48px" }}>
        <div style={{ maxWidth: "580px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
            For Jobber users
          </p>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, color: "#F5F3EE", lineHeight: 1.3, marginBottom: "16px" }}>
            Jobber tracks your jobs. <span style={{ color: "#E8934A" }}>We make sure the phone never costs you money.</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#9AAABB", lineHeight: 1.6, maxWidth: "480px", marginBottom: "28px" }}>
            Jobber is solid for scheduling and invoicing. But when you miss a call or a job cancels, someone has to follow up. We handle that automatically — 24 hours a day, while you&apos;re on the job.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <a
              href="#lead-form"
              style={{ fontSize: "14px", background: "#E8934A", color: "#fff", border: "none", padding: "11px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: 500, textDecoration: "none", display: "inline-block" }}
            >
              Try it free for 30 days
            </a>
            <a
              href="#features"
              style={{ fontSize: "13px", color: "#9AAABB", textDecoration: "underline", cursor: "pointer" }}
            >
              See how it works →
            </a>
          </div>
        </div>
      </section>

      <section style={{ background: "#111E2E", padding: "20px 32px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
        {[
          { n: "30 sec", l: "We text back missed calls. Most competitors take 47 hours." },
          { n: "$8,600", l: "Extra money per month for the average contractor we work with." },
          { n: "Zero", l: "Changes to Jobber. Your team keeps working the same way." },
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

export default function JobberPage() {
  return (
    <>
      <Header />
      <main>
        <JobberHero />
        <Features />
        <Pricing />
        <Guarantee />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
