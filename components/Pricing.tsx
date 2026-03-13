"use client";

import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Jobber",
    price: "$1,500",
    description: "Our MVP platform. Fastest onboarding, full API access.",
    features: [
      "Emergency lead capture 24/7",
      "Cancellation recovery & waitlist texting",
      "80% dispatcher automation",
      "Real-time dashboard with ROI proof",
      "Human-in-the-loop approvals",
      "Works on Jobber (Grow or Plus plan)",
      "Setup included",
      "30-day free trial (5 leads + 2 fills guarantee)",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "ServiceTitan",
    price: "$2,000",
    description: "For bigger HVAC operations with ServiceTitan",
    features: [
      "Everything in Jobber plan",
      "Works on ServiceTitan (The Works + Marketing Pro)",
      "Higher ROI math (bigger job values)",
      "20+ leads/month recovery potential",
      "Dedicated support for ServiceTitan setup",
      "Advanced routing optimization",
      "30-day free trial (5 leads + 2 fills guarantee)",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "No CRM Yet?",
    price: "$3,500",
    description: "We set up Jobber + our system. Full stack solution.",
    features: [
      "Everything in Jobber plan",
      "Jobber account setup & configuration",
      "Team member onboarding",
      "Custom SMS templates for your business",
      "Full training for your team",
      "Faster ROI (integrated from day one)",
      "30-day free trial (5 leads + 2 fills guarantee)",
    ],
    cta: "Let's Talk Setup",
    popular: false,
  },
];

export default function Pricing() {
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

  const scrollToForm = () => {
    const formEl = document.getElementById("lead-form");
    formEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-4">
              Pricing by CRM
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6">
              Simple, Straightforward Pricing
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Pick your plan based on which CRM you're on. Month-to-month. No contracts. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-2xl ${
                plan.popular
                  ? "border-2 border-amber-500 shadow-xl shadow-amber-500/10"
                  : "border border-slate-200"
              } p-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-display font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-600 text-sm">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={scrollToForm}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div
          className={`text-center mt-12 ${
            isVisible ? "animate-fade-in-up delay-500" : "opacity-0"
          }`}
        >
          <p className="text-slate-500">
            All plans: <strong>30-day free trial</strong>. If we don't capture 5 leads and fill 2 cancellations, you pay nothing.{" "}
            <button
              onClick={scrollToForm}
              className="text-amber-600 font-medium hover:underline"
            >
              Ready to start?
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
