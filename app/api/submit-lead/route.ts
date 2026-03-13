import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { leadInsertSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

/**
 * POST /api/submit-lead
 *
 * Handles lead form submissions:
 * 1. Rate limiting by IP address
 * 2. Input validation with Zod
 * 3. Insert into Supabase leads table
 * 4. Return success/error response
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

    // Check rate limit (5 submissions per hour per IP)
    const rateLimitResult = checkRateLimit(ip);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: "Too many submissions. Please try again later.",
          resetAt: rateLimitResult.resetAt?.toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetAt
              ? Math.ceil(
                  (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
                ).toString()
              : "3600",
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Remove the agreed_to_contact field before validation (it's only for client-side)
    const { agreed_to_contact, ...leadData } = body;

    // Validate with Zod schema
    const validatedData = leadInsertSchema.parse(leadData);

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error("Supabase admin client not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Insert lead into Supabase
    const { data, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        business_name: validatedData.business_name,
        owner_name: validatedData.owner_name,
        email: validatedData.email,
        phone: validatedData.phone,
        industry: validatedData.industry,
        monthly_calls_missed: validatedData.monthly_calls_missed ?? null,
        ip_address: ip,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);

      // Handle duplicate email gracefully
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This email has already been submitted" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to submit form. Please try again." },
        { status: 500 }
      );
    }

    // Log successful submission (in production, send to analytics/email)
    console.log(`New lead submitted: ${validatedData.email} from ${ip}`);

    // TODO: Send confirmation email to lead
    // TODO: Send notification email to admin

    return NextResponse.json(
      {
        success: true,
        message: "Lead submitted successfully",
        leadId: data?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Log unexpected errors
    console.error("Unexpected error in submit-lead:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
