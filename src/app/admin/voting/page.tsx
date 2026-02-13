import { createClient } from "@/lib/supabase/server";
import { VotingControl } from "@/components/admin/voting-control";
import type { Poll } from "@/lib/types";

export default async function AdminVotingPage() {
  const supabase = await createClient();
  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Voting Control</h1>
      <VotingControl initialPolls={(polls || []) as Poll[]} />
    </div>
  );
}
