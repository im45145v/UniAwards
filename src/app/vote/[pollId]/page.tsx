import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { VotingGrid } from "@/components/voting-grid";
import { LiveResults } from "@/components/live-results";
import type { User, NominationWithVotes } from "@/lib/types";

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

  // Get vote counts for each nomination
  const { data: votes } = await supabase
    .from("votes")
    .select("nomination_id")
    .eq("poll_id", pollId);

  const voteCounts: Record<string, number> = {};
  (votes || []).forEach((v) => {
    voteCounts[v.nomination_id] = (voteCounts[v.nomination_id] || 0) + 1;
  });

  const nominationsWithVotes: NominationWithVotes[] = (nominations || []).map((n) => ({
    ...n,
    vote_count: voteCounts[n.id] || 0,
  }));

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar user={dbUser as User} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">{poll.title}</h1>
          {poll.description && (
            <p className="mt-2 text-lg text-neutral-600">{poll.description}</p>
          )}
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VotingGrid
              pollId={poll.id}
              nominations={nominationsWithVotes}
              userId={authUser.id}
              userRole={(dbUser as User)?.role || "viewer"}
              hasVoted={!!existingVote}
              endsAt={poll.ends_at}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LiveResults
                pollId={poll.id}
                initialNominations={nominationsWithVotes}
                endsAt={poll.ends_at}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
