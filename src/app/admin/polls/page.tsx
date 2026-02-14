import { createClient } from "@/lib/supabase/server";
import { PollsManager } from "@/components/admin/polls-manager";
import type { Poll } from "@/lib/types";

export default async function AdminPollsPage() {
  const supabase = await createClient();
  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Poll Management</h1>
      <PollsManager initialPolls={(polls || []) as Poll[]} />
    </div>
  );
}
