import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { NominationForm } from "@/components/nomination-form";
import type { User, Poll } from "@/lib/types";

interface NominatePageProps {
  params: Promise<{ pollId: string }>;
}

export default async function NominatePage({ params }: NominatePageProps) {
  const { pollId } = await params;
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

  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (!poll || poll.status !== "NOMINATION_OPEN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={dbUser as User} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{poll.title}</h1>
        <p className="mb-8 text-neutral-500">{poll.description}</p>
        <NominationForm pollId={poll.id} userId={authUser.id} />
      </main>
    </div>
  );
}
