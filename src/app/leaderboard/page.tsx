import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PublicLeaderboardContent } from "@/components/public-leaderboard-content";
import type { NominationWithVotes } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

export default async function PublicLeaderboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Get all polls
  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  // Early return if no polls
  if (!polls || polls.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/leaderboard" className="text-xl font-bold">
              🏆 UniAwards Leaderboard
            </Link>
            <div className="flex items-center gap-3">
              {authUser ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    <LogIn className="mr-1 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <PublicLeaderboardContent polls={[]} />
        </main>
      </div>
    );
  }

  const pollIds = polls.map((p) => p.id);

  // Fetch all nominations for all polls in one query
  const { data: allNominations } = await supabase
    .from("nominations")
    .select("*")
    .in("poll_id", pollIds)
    .eq("approved", true);

  // Fetch all votes for all polls in one query
  const { data: allVotes } = await supabase
    .from("votes")
    .select("nomination_id, poll_id")
    .in("poll_id", pollIds);

  // Group nominations by poll_id
  const nominationsByPoll: Record<string, NonNullable<typeof allNominations>> = {};
  (allNominations || []).forEach((nom) => {
    if (!nominationsByPoll[nom.poll_id]) {
      nominationsByPoll[nom.poll_id] = [];
    }
    nominationsByPoll[nom.poll_id]!.push(nom);
  });

  // Group votes by poll_id and count by nomination_id
  const votesByPoll: Record<string, Record<string, number>> = {};
  (allVotes || []).forEach((vote) => {
    if (!votesByPoll[vote.poll_id]) {
      votesByPoll[vote.poll_id] = {};
    }
    votesByPoll[vote.poll_id][vote.nomination_id] =
      (votesByPoll[vote.poll_id][vote.nomination_id] || 0) + 1;
  });

  // Build polls with leaderboards
  const pollsWithLeaderboards = polls.map((poll) => {
    const nominations = nominationsByPoll[poll.id] || [];
    const voteCounts = votesByPoll[poll.id] || {};

    const nominationsWithVotes: NominationWithVotes[] = nominations
      .map((n) => ({
        ...n,
        vote_count: voteCounts[n.id] || 0,
      }))
      .sort((a, b) => b.vote_count - a.vote_count);

    const totalVotes = nominationsWithVotes.reduce(
      (sum, n) => sum + n.vote_count,
      0
    );

    return {
      ...poll,
      nominations: nominationsWithVotes,
      totalVotes,
    };
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Public Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/leaderboard" className="text-xl font-bold">
            🏆 UniAwards Leaderboard
          </Link>
          <div className="flex items-center gap-3">
            {authUser ? (
              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Live Leaderboard</h1>
          <p className="mt-2 text-neutral-600">
            View real-time results for all polls. No login required!
          </p>
        </div>
        <PublicLeaderboardContent polls={pollsWithLeaderboards} />
      </main>
    </div>
  );
}
