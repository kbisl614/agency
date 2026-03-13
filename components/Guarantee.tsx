"use client";

import { useEffect, useRef, useState } from "react";

export default function Guarantee() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 hero-gradient relative overflow-hidden"
    >
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
        <div
          className={`max-w-4xl mx-auto text-center ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Shield Icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          {/* Guarantee Text */}
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-6 leading-tight">
            5 Emergency Leads + 2 Cancellations Filled in 30 Days
            <br />
            <span className="gradient-text">Or Your First Month Is Free</span>
          </h2>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            We handle your setup completely. You just watch it work. If we don&apos;t capture at least 5 emergency leads and fill 2 cancellations in your first 30 days, you pay nothing. That&apos;s a minimum of $1,200 in recovered value — guaranteed.
          </p>

          {/* Trust Points */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-12">
            {[
              { icon: "check", text: "We set everything up" },
              { icon: "check", text: "Month-to-month, cancel anytime" },
              { icon: "check", text: "Zero risk performance guarantee" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 text-slate-300 ${
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-400"
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
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              const formEl = document.getElementById("lead-form");
              formEl?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`btn btn-primary text-lg px-10 py-5 animate-pulse-glow ${
              isVisible ? "animate-fade-in-up delay-500" : "opacity-0"
            }`}
          >
            Start Your 30-Day Free Trial
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
        </div>
      </div>
    </section>
  );
}
