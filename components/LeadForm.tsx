"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadFormSchema,
  type LeadFormData,
  INDUSTRIES,
  formatPhoneNumber,
} from "@/lib/validation";

export default function LeadForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      business_name: "",
      owner_name: "",
      email: "",
      phone: "",
      industry: undefined,
      monthly_calls_missed: undefined,
      agreed_to_contact: false,
    },
  });

  // Watch phone value for formatting
  const phoneValue = watch("phone");

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      setSubmitSuccess(true);
      reset();

      // Redirect to thank you page after brief delay
      setTimeout(() => {
        window.location.href = "/thank-you";
      }, 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="lead-form"
      ref={sectionRef}
      style={{ background: "var(--bg-primary)", padding: "72px clamp(16px, 4vw, 32px)" }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Section Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-500)", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>
              Get started
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.2 }}>
              Try it free for 30 days.
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              No credit card. We&apos;ll call you today. We do the setup — takes about 20 minutes on our end. If we don&apos;t get you 5 leads and fill 2 open jobs, your first month is free.
            </p>
          </div>

          {/* Form Card */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "clamp(20px, 4vw, 32px)", border: "0.5px solid var(--border-subtle)" }}>
            {/* Success State */}
            {submitSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-emerald-500"
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
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                  Your Trial Is Set Up!
                </h3>
                <p className="text-slate-600">
                  We&apos;ll contact you within 2 hours to finalize setup. Redirecting...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Smith's HVAC & Plumbing"
                    className={`input-field ${
                      errors.business_name ? "border-red-400" : ""
                    }`}
                    {...register("business_name")}
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.business_name.message}
                    </p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    className={`input-field ${
                      errors.owner_name ? "border-red-400" : ""
                    }`}
                    {...register("owner_name")}
                  />
                  {errors.owner_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.owner_name.message}
                    </p>
                  )}
                </div>

                {/* Email & Phone Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className={`input-field ${
                        errors.email ? "border-red-400" : ""
                      }`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      className={`input-field ${
                        errors.phone ? "border-red-400" : ""
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`input-field ${
                      errors.industry ? "border-red-400" : ""
                    }`}
                    {...register("industry")}
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.industry.message}
                    </p>
                  )}
                </div>

                {/* Monthly Calls Missed (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Approximate monthly calls you miss{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 20"
                    min="0"
                    className="input-field"
                    {...register("monthly_calls_missed", {
                      setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                    })}
                  />
                </div>

                {/* Agreement Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      {...register("agreed_to_contact")}
                    />
                    <span className="text-sm text-slate-600">
                      I agree to be contacted via email and phone about my demo
                      booking. I can unsubscribe anytime.{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.agreed_to_contact && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreed_to_contact.message}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center gap-2">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-500 text-slate-950 font-display font-bold rounded-lg hover:bg-amber-600 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Start my free trial"
                  )}
                </button>

                {/* Trust Note */}
                <p className="text-center text-slate-500 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                    No credit card required
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-emerald-500"
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
                    Takes less than 2 minutes
                  </span>
                </p>
              </form>
            )}
          </div>
      </div>
    </section>
  );
}
