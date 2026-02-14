import { createClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";
import type { User } from "@/lib/types";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">User Management</h1>
      <UsersManager initialUsers={(users || []) as User[]} />
    </div>
  );
}
