import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: polls } = await supabase.from("polls").select("*");
  const { data: nominations } = await supabase.from("nominations").select("*");
  const { data: votes } = await supabase.from("votes").select("*");
  const { data: users } = await supabase.from("users").select("*");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Analytics</h1>
      <AnalyticsDashboard
        pollCount={polls?.length || 0}
        nominationCount={nominations?.length || 0}
        voteCount={votes?.length || 0}
        userCount={users?.length || 0}
        polls={polls || []}
        votes={votes || []}
      />
    </div>
  );
}
