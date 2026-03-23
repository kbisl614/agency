import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(request: NextRequest) {
  // Verify caller is an authenticated admin
  const serverSupabase = await createSupabaseServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const { data: callerProfile } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    business_name,
    first_name,
    owner_email,
    owner_phone,
    crm_type,
    review_link,
    jobber_api_key,
    responder,
    quoter,
    dispatcher,
    advisor,
  } = body;

  if (!business_name || !first_name || !owner_email || !owner_phone || !crm_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tempPassword = generateTempPassword();

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: owner_email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create auth user" }, { status: 500 });
  }

  const userId = authData.user.id;

  // Insert into clients table (contractor_id = auth user id)
  const { error: clientError } = await supabaseAdmin.from("clients").insert({
    contractor_id: userId,
    business_name,
    first_name: first_name || null,
    owner_email,
    owner_phone,
    crm_type,
    review_link: review_link || null,
    jobber_api_key: jobber_api_key || null,
    agents_active: { responder, quoter, dispatcher, advisor },
    is_active: true,
  });

  if (clientError) {
    // Roll back the auth user if client insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  // Insert into users table
  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: userId,
    contractor_id: userId,
    email: owner_email,
    role: "client",
  });

  if (userError) {
    const { error: clientDeleteError } = await supabaseAdmin
      .from("clients").delete().eq("contractor_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    if (clientDeleteError) {
      return NextResponse.json(
        { error: "Onboard failed and rollback incomplete — clients row may be orphaned. Contact support." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, tempPassword }, { status: 201 });
}
