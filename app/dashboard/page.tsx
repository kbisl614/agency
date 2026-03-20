import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!supabaseAdmin) redirect("/login");

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("contractor_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("business_name, first_name, agents_active")
    .eq("contractor_id", profile.contractor_id)
    .single();

  if (!client) redirect("/login");

  return (
    <DashboardClient
      businessName={client.business_name}
      firstName={client.first_name ?? null}
    />
  );
}
