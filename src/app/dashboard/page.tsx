import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { DashboardContent } from "@/components/dashboard-content";
import type { User, Poll } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const now = new Date().toISOString();
  await supabase
    .from("polls")
    .update({ status: "VOTING_CLOSED" })
    .eq("status", "VOTING_OPEN")
    .lt("ends_at", now);

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={dbUser as User} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Awards Dashboard</h1>
        <DashboardContent polls={(polls || []) as Poll[]} />
      </main>
    </div>
  );
}
