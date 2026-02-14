import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { User } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={dbUser as User} />
      <div className="flex">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
