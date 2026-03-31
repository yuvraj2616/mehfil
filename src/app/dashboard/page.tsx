import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default async function DashboardRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch profile role from backend API
  const data = await fetchAPI(`/profiles/me`);
  const role = data?.profile?.role || "attendee";
  redirect(`/dashboard/${role}`);
}
