import { getSupabaseServer } from "@/lib/supabase-server";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardContent email={user?.email ?? ""} />;
}
