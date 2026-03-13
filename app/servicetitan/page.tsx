import Header from "@/components/Header";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Guarantee from "@/components/Guarantee";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

/**
 * ServiceTitan Contractor Landing Page
 *
 * Tailored for HVAC contractors already using ServiceTitan for field operations.
 * Key message: "ServiceTitan Knows What Happened. We Make Things Happen."
 */

export const metadata = {
  title: "Automated Emergency Dispatch for ServiceTitan | DispatchHVAC",
  description:
    "Turn ServiceTitan data into live lead capture. We automatically fill emergency calls and cancellations. 30-day free trial.",
  keywords: [
    "HVAC contractor",
    "ServiceTitan integration",
    "emergency leads",
    "dispatch automation",
    "service routing",
  ],
};

function ServiceTitanHero() {
  return (
    <section className="py-24 lg:py-32 hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 animate-fade-in-down">
            <span className="text-sm font-semibold text-amber-400">
              For ServiceTitan Contractors
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up">
            ServiceTitan Knows What Happened
            <br />
            <span className="gradient-text">We Make Things Happen</span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            Deep integration with your ServiceTitan account. While you're handling jobs, we're capturing emergency calls and filling your cancellations automatically. Revenue on autopilot.
          </p>

          {/* Value Props */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-200">
            {[
              {
                icon: "⚡",
                label: "$150",
                description: "Per recovered emergency call",
              },
              {
                icon: "🔧",
                label: "$175",
                description: "Per cancellation fill",
              },
              {
                icon: "📞",
                label: "24/7",
                description: "Automated capture & dispatch",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-display font-bold text-white mb-1">
                  {item.label}
                </div>
                <div className="text-sm text-slate-400">{item.description}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              const formEl = document.getElementById("lead-form");
              formEl?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn btn-primary text-lg px-10 py-5 animate-pulse-glow animate-fade-in-up delay-300"
          >
            Start Free Trial with ServiceTitan
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>

          {/* Trust Signal */}
          <p className="text-slate-400 text-sm mt-8 animate-fade-in-up delay-400">
            No credit card. $2,000/month. Perfect for contractors already on ServiceTitan.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ServiceTitanPage() {
  return (
    <>
      <Header />
      <main>
        <ServiceTitanHero />
        <Features />
        <Pricing />
        <Guarantee />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
