import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Redirect regardless — browser clears the session cookie
  }
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
