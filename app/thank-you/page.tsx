import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trial Set Up! | DispatchHVAC",
  description: "Your 30-day free trial is set up. We'll contact you within 2 hours to finalize setup and start capturing your emergency leads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen hero-gradient flex items-center justify-center px-4">
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
      <div className="absolute top-20 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-scale-in">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-6 animate-fade-in-up">
          Your 30-Day Trial Is Set Up!
        </h1>

        <p className="text-xl text-slate-300 mb-8 leading-relaxed animate-fade-in-up delay-100">
          We&apos;ll contact you within 2 hours to finalize your setup. Once we integrate with your CRM, the system starts capturing your emergency leads automatically.
        </p>

        {/* What to Expect */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10 animate-fade-in-up delay-200">
          <h2 className="text-xl font-display font-bold text-white mb-6">
            What Happens Next
          </h2>
          <div className="space-y-4 text-left">
            {[
              {
                step: "1",
                title: "Our team contacts you",
                description:
                  "We'll call within 2 hours to confirm your CRM details and schedule (Jobber, ServiceTitan, or custom setup).",
              },
              {
                step: "2",
                title: "System integration",
                description:
                  "We connect to your CRM and configure the dispatch automation. Usually takes 30-60 minutes.",
              },
              {
                step: "3",
                title: "Start capturing leads",
                description:
                  "The system goes live and begins capturing your emergency calls and filling cancellations 24/7.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trial Guarantee */}
        <div className="mb-10 animate-fade-in-up delay-300">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-display font-bold text-white mb-4">
              Your Guarantee
            </h3>
            <p className="text-slate-300 mb-4">
              If we don&apos;t capture at least <strong>5 emergency leads</strong> and fill <strong>2 cancellations</strong> in your first 30 days, your first month is free.
            </p>
            <p className="text-slate-400 text-sm">
              That&apos;s a minimum of <strong>$1,200 in recovered revenue</strong> — zero risk on your end.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors animate-fade-in-up delay-400"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
