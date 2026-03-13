"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    title: "Emergency Lead Capture",
    description:
      "AI captures every inbound lead — phone, SMS, web form — in under 30 seconds. Qualifies urgency, sends human-sounding response automatically. Your 2 AM emergency calls get answered.",
    stat: "10 calls",
    statLabel: "$1,500/month recovered",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    title: "Cancellation Recovery",
    description:
      "Monitors your calendar in real-time. When a job cancels, instantly texts your waitlist customers in that service area. Books the slot back. No dispatcher involved.",
    stat: "4 fills",
    statLabel: "$700/month recovered",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Dispatcher Automation",
    description:
      "Routes calls to best-fit techs. Sends customer ETAs. Post-job follow-ups. Chases invoices. Seasonal tune-up reminders. Handles 80% of routine dispatch work your team wastes time on.",
    stat: "80%",
    statLabel: "of dispatch work handled",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Real-Time Dashboard",
    description:
      "Log in and see exactly what the system did: leads captured, cancellations filled, revenue recovered. Color-coded by urgency. Proof of performance every single day.",
    stat: "$4,700",
    statLabel: "total monthly value",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 section-pattern opacity-50" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div
            className={`${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-4">
              The Three Revenue Channels
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6">
              How You Make $4,700/Month
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Every feature of our system maps directly to revenue recovery. Here are the three ways we fill your schedule and keep your techs busy.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-2xl p-8 border border-slate-200 card-hover ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Stat */}
              <div className="flex items-baseline gap-2 pt-4 border-t border-slate-100">
                <span className="text-2xl font-display font-bold text-amber-500">
                  {feature.stat}
                </span>
                <span className="text-sm text-slate-500">
                  {feature.statLabel}
                </span>
              </div>

              {/* Hover border accent */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-amber-500/20 transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 ${
            isVisible ? "animate-fade-in-up delay-500" : "opacity-0"
          }`}
        >
          <p className="text-slate-600 mb-4">
            Ready to see it in action?
          </p>
          <button
            onClick={() => {
              const formEl = document.getElementById("lead-form");
              formEl?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
          >
            Book a demo
            <svg
              className="w-4 h-4"
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
        </div>
      </div>
    </section>
  );
}
