"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [moneyLost, setMoneyLost] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Animated counter: shows money lost from missed emergency calls per month
    // HVAC: ~$150 per emergency call, 10 calls missed per month = $1,500/month
    const targetAmount = 1500; // $1,500/month lost per contractor
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetAmount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetAmount) {
        setMoneyLost(targetAmount);
        clearInterval(timer);
      } else {
        setMoneyLost(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const scrollToForm = () => {
    const formElement = document.getElementById("lead-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Headlines */}
          <div
            className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Works on Jobber & ServiceTitan
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.05] mb-6">
              Your HVAC Business Running at{" "}
              <span className="gradient-text">2 AM Without You</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-xl">
              AI captures every emergency lead in 30 seconds. Fills cancellations while you sleep. Handles 80% of your dispatch work. All on top of Jobber.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={scrollToForm}
                className="btn btn-primary animate-pulse-glow text-base px-8 py-4"
              >
                Start Free 30-Day Trial
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
              <button
                onClick={() => {
                  const featuresEl = document.getElementById("features");
                  featuresEl?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn btn-secondary text-base px-8 py-4"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row gap-6 text-slate-400">
              {[
                "We set everything up",
                "5 leads + 2 fills or you pay nothing",
                "Zero CRM migration",
              ].map((text, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${
                    isVisible ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <svg
                    className="w-5 h-5 text-emerald-500"
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
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats Card */}
          <div
            className={`${
              isVisible ? "animate-fade-in-up delay-300" : "opacity-0"
            }`}
          >
            <div className="relative">
              {/* Main Card */}
              <div className="glass rounded-2xl p-8 lg:p-10">
                <div className="text-center mb-8">
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                    You're Losing Per Month
                  </p>
                  <div className="text-5xl lg:text-6xl font-display font-bold text-red-400 mb-2">
                    ${moneyLost.toLocaleString()}
                    <span className="text-2xl text-slate-500">/mo</span>
                  </div>
                  <p className="text-slate-400">From missed emergency calls</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-6">
                  {[
                    { value: "29 hrs", label: "Avg Response Time" },
                    { value: "$150", label: "Per Emergency Call" },
                    { value: "78%", label: "First Responder Wins" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl lg:text-2xl font-display font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg animate-float">
                +$4,700 recovered/mo
              </div>

              <div className="absolute -bottom-4 -left-4 bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg shadow-lg animate-float delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-slate-950"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      AC emergency captured
                    </p>
                    <p className="text-slate-500 text-xs">2:47 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
