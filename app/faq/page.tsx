"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "integration" | "pricing" | "performance" | "setup" | "general";
}

const faqItems: FAQItem[] = [
  // Integration & Setup
  {
    category: "integration",
    question: "How does DispatchHVAC integrate with my CRM?",
    answer:
      "We connect directly to your Jobber, ServiceTitan, or HouseCall Pro API. Once you authorize our integration, we read your incoming calls and cancellations in real-time, then route them to your techs automatically. Setup takes 30-60 minutes.",
  },
  {
    category: "setup",
    question: "Do I have to change how I run my business?",
    answer:
      "No. The system works alongside your existing CRM. Your team keeps using Jobber/ServiceTitan/HCP exactly as they do now. We just add an automated layer on top that captures leads you would have missed. Zero workflow changes.",
  },
  {
    category: "integration",
    question: "What if I don't have a CRM yet?",
    answer:
      "We set up Jobber for you as part of your trial. Cost is $3,500/month (includes Jobber account creation and configuration). We handle the entire setup—you just get the leads.",
  },
  {
    category: "setup",
    question: "How long does onboarding take?",
    answer:
      "Initial setup is 2-3 hours. We'll call within 2 hours of your submission to confirm your CRM details and schedule the integration window. Most contractors are live within 24 hours of starting their trial.",
  },

  // Performance & Guarantee
  {
    category: "performance",
    question: "What's the performance guarantee?",
    answer:
      "We guarantee 5 emergency leads + 2 cancellation fills in your first 30 days. If we don't hit those numbers, your first month is free. That's a minimum of $1,200 in recovered revenue with zero risk on your part.",
  },
  {
    category: "performance",
    question: "How many leads can I realistically expect?",
    answer:
      "Most HVAC contractors capture 8-15 emergency calls and 3-5 cancellation fills in their first 30 days. We're conservative with the guarantee (5 leads + 2 fills) because most beat it. Your actual numbers depend on call volume in your area.",
  },
  {
    category: "performance",
    question: "Will this actually fill my cancellations?",
    answer:
      "Yes. We monitor your schedule and automatically route inbound emergency calls to your open slots. Technicians accept or reject via text. Average fill rate is 60-70% of routed calls. You make the final call on every job.",
  },
  {
    category: "performance",
    question: "What if I'm too busy to take the leads?",
    answer:
      "Pause the system anytime. You control when you're receiving leads via a simple dashboard. If you're at capacity, just toggle it off. No penalties, no contracts.",
  },

  // Pricing & Billing
  {
    category: "pricing",
    question: "Why does ServiceTitan cost more than Jobber?",
    answer:
      "ServiceTitan integration is more complex—deeper API access, larger contractor base, and different sync requirements. Jobber is simpler to integrate, so it's $1,500/month. ServiceTitan is $2,000/month. The guarantee is the same either way.",
  },
  {
    category: "pricing",
    question: "Is there a contract?",
    answer:
      "No contract. Month-to-month billing. Cancel anytime with 30 days notice. We don't lock you in because the system speaks for itself.",
  },
  {
    category: "pricing",
    question: "When does billing start?",
    answer:
      "Billing starts after your 30-day free trial ends—on day 31. If you don't hit the guarantee (5 leads + 2 fills), we credit your first month and you start on day 61 for free. Either way, nothing until the trial is done.",
  },
  {
    category: "pricing",
    question: "What if I want to add team members or scale usage?",
    answer:
      "Pricing is flat—unlimited team members, unlimited calls, unlimited routing. One rate covers everything. No per-lead fees, no surprises.",
  },

  // General Questions
  {
    category: "general",
    question: "Is my data safe?",
    answer:
      "Yes. We use Supabase (enterprise-grade security) for data storage, SSL encryption for all API calls, and never store payment information. We comply with standard data protection practices and your data is yours—export it anytime.",
  },
  {
    category: "general",
    question: "What if I want to migrate away later?",
    answer:
      "We'll export all your lead history and customer data in standard formats. Migration is straightforward. But we're confident you won't want to leave once the leads start coming in.",
  },
  {
    category: "general",
    question: "Do you do tech support?",
    answer:
      "Yes. Email support during business hours, phone support for critical issues. Your trial includes dedicated onboarding—we're invested in your success.",
  },
  {
    category: "general",
    question: "What if something breaks?",
    answer:
      "We monitor the system 24/7 for integration issues. If something goes down, we fix it immediately and credit your account for any downtime. Uptime SLA: 99.5%.",
  },
];

export const metadata = {
  title: "FAQ | DispatchHVAC",
  description:
    "Common questions about DispatchHVAC HVAC dispatch automation, integrations, pricing, and guarantees.",
};

function FAQPageContent() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "integration", label: "Integration & Setup" },
    { id: "pricing", label: "Pricing & Billing" },
    { id: "performance", label: "Performance" },
    { id: "general", label: "General" },
  ];

  const filteredFAQ =
    activeCategory === "all"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <>
      <Header />
      <main>
        <section
          ref={sectionRef}
          className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 section-pattern opacity-30" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            {/* Header */}
            <div
              className={`max-w-2xl mx-auto text-center mb-16 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-4">
                Questions? We Have Answers
              </p>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-slate-600">
                Everything HVAC contractors need to know about DispatchHVAC,
                integrations, pricing, and our performance guarantee.
              </p>
            </div>

            {/* Category Filter */}
            <div
              className={`flex flex-wrap justify-center gap-3 mb-12 ${
                isVisible ? "animate-fade-in-up delay-100" : "opacity-0"
              }`}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "bg-amber-500 text-slate-950"
                      : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div
              className={`max-w-3xl mx-auto space-y-4 ${
                isVisible ? "animate-fade-in-up delay-200" : "opacity-0"
              }`}
            >
              {filteredFAQ.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() =>
                      setActiveIndex(activeIndex === idx ? null : idx)
                    }
                    className="w-full px-6 py-5 flex items-start justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="font-semibold text-slate-900 text-lg pr-4">
                      {item.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform ${
                        activeIndex === idx ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-amber-500"
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
                    </span>
                  </button>

                  {activeIndex === idx && (
                    <div className="border-t border-slate-200 px-6 py-5 bg-slate-50">
                      <p className="text-slate-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div
              className={`mt-16 text-center ${
                isVisible ? "animate-fade-in-up delay-300" : "opacity-0"
              }`}
            >
              <p className="text-slate-600 mb-6">
                Still have questions? Get in touch—we respond within 2 hours.
              </p>
              <a
                href="mailto:hello@callconvert.ai"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Contact Our Team
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default FAQPageContent;
