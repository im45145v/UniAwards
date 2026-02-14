import { createClient } from "@/lib/supabase/server";
import { NominationsManager } from "@/components/admin/nominations-manager";
import type { NominationWithUser } from "@/lib/types";

export default async function AdminNominationsPage() {
  const supabase = await createClient();
  const { data: nominations } = await supabase
    .from("nominations")
    .select("*, users(email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Nomination Moderation</h1>
      <NominationsManager initialNominations={(nominations || []) as NominationWithUser[]} />
    </div>
  );
}
