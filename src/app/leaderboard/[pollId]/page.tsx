import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { LeaderboardContent } from "@/components/leaderboard-content";
import type { User, NominationWithVotes } from "@/lib/types";

interface LeaderboardPageProps {
  params: Promise<{ pollId: string }>;
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
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

  if (!poll) {
    redirect("/dashboard");
  }

  // Get nominations with vote counts
  const { data: nominations } = await supabase
    .from("nominations")
    .select("*")
    .eq("poll_id", pollId)
    .eq("approved", true);

  const { data: votes } = await supabase
    .from("votes")
    .select("nomination_id")
    .eq("poll_id", pollId);

  // Calculate vote counts
  const voteCounts: Record<string, number> = {};
  (votes || []).forEach((v) => {
    voteCounts[v.nomination_id] = (voteCounts[v.nomination_id] || 0) + 1;
  });

  const nominationsWithVotes: NominationWithVotes[] = (nominations || [])
    .map((n) => ({
      ...n,
      vote_count: voteCounts[n.id] || 0,
    }))
    .sort((a, b) => b.vote_count - a.vote_count);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={dbUser as User} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{poll.title}</h1>
        <p className="mb-8 text-neutral-500">Leaderboard &amp; Results</p>
        <LeaderboardContent nominations={nominationsWithVotes} />
      </main>
    </div>
  );
}
