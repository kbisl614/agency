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
      agreed_to_contact: true,
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
      id="book-call"
      ref={sectionRef}
      style={{ background: "var(--bg-primary)", padding: "clamp(48px, 8vw, 72px) clamp(20px, 5vw, 72px)" }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          {/* Section Header */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--orange-500)", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>
              Book a discovery call
            </p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px", lineHeight: 1.25 }}>
              Let&apos;s talk. 30 minutes.
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              We&apos;ll map your workflow, look at where calls and jobs are slipping, and tell you honestly whether we&apos;re the right fit. No pitch. No obligation.
            </p>
          </div>

          {/* Form Card */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "clamp(20px, 4vw, 32px)", border: "0.5px solid var(--border-subtle)" }}>
            {/* Success State */}
            {submitSuccess ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1A7A4A" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
                  We&apos;ll be in touch today.
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Expect a call or text within a few hours to confirm your time. Redirecting...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Business name <span style={{ color: "#E85A4A" }}>*</span>
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
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Your name <span style={{ color: "#E85A4A" }}>*</span>
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
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                      Email <span style={{ color: "#E85A4A" }}>*</span>
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
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                      Phone <span style={{ color: "#E85A4A" }}>*</span>
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

                {/* Software */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    What scheduling software do you use? <span style={{ color: "#E85A4A" }}>*</span>
                  </label>
                  <select
                    className={`input-field ${
                      errors.industry ? "border-red-400" : ""
                    }`}
                    {...register("industry")}
                  >
                    <option value="">Select your software</option>
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

                {/* Tech count (Optional) */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    How many techs do you run?{" "}
                    <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 8"
                    min="1"
                    className="input-field"
                    {...register("monthly_calls_missed", {
                      setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                    })}
                  />
                </div>

                {/* Hidden agreed_to_contact — defaulted to true, not shown */}

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
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: isSubmitting ? "#9AAABB" : "#E8934A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "background 0.15s",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Request a discovery call"}
                </button>

                {/* Trust Note */}
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  We&apos;ll reach out within a few hours to confirm your time. No contracts, no pressure.
                </p>
              </form>
            )}
          </div>
      </div>
    </section>
  );
}
