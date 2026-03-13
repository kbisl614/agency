import { z } from "zod";

/**
 * Industry options for the lead form dropdown
 * Currently HVAC-only (Phase 1)
 * Phase 2 will expand to other HVAC-adjacent trades
 */
export const INDUSTRIES = [
  "HVAC Contractor",
  "HVAC with Plumbing",
  "HVAC with Electrical",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

/**
 * Phone number formatting helper
 * Converts "5551234567" to "(555) 123-4567"
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX
  if (cleaned.length >= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length >= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length >= 3) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length > 0) {
    return `(${cleaned}`;
  }

  return "";
}

/**
 * Lead Form Validation Schema
 *
 * Uses Zod for runtime type validation with helpful error messages.
 * This schema validates both client-side (react-hook-form) and server-side (API).
 */
export const leadFormSchema = z.object({
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(255, "Business name is too long"),

  owner_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),

  phone: z
    .string()
    .regex(
      /^\(\d{3}\) \d{3}-\d{4}$/,
      "Phone must be in (XXX) XXX-XXXX format"
    ),

  industry: z.enum(INDUSTRIES, {
    message: "Please select your industry",
  }),

  monthly_calls_missed: z
    .number()
    .int()
    .min(0, "Must be a positive number")
    .max(10000, "Please enter a realistic number")
    .optional()
    .nullable(),

  agreed_to_contact: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to be contacted",
    }),
});

/**
 * TypeScript type derived from the Zod schema
 * Use this for type-safe form handling
 */
export type LeadFormData = z.infer<typeof leadFormSchema>;

/**
 * Server-side validation schema (without the checkbox)
 * Used in the API route after form submission
 */
export const leadInsertSchema = leadFormSchema.omit({ agreed_to_contact: true });

export type LeadInsertData = z.infer<typeof leadInsertSchema>;
