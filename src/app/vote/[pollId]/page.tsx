import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { VotingGrid } from "@/components/voting-grid";
import type { User, Poll, Nomination } from "@/lib/types";

interface VotePageProps {
  params: Promise<{ pollId: string }>;
}

export default async function VotePage({ params }: VotePageProps) {
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

  if (!poll || poll.status !== "VOTING_OPEN") {
    redirect("/dashboard");
  }

  const { data: nominations } = await supabase
    .from("nominations")
    .select("*")
    .eq("poll_id", pollId)
    .eq("approved", true)
    .order("created_at");

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={dbUser as User} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{poll.title}</h1>
        <p className="mb-8 text-neutral-500">{poll.description}</p>
        <VotingGrid
          pollId={poll.id}
          nominations={(nominations || []) as Nomination[]}
          userId={authUser.id}
          userRole={(dbUser as User)?.role || "viewer"}
          hasVoted={!!existingVote}
        />
      </main>
    </div>
  );
}
