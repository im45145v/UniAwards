"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, Vote } from "lucide-react";
import type { Nomination, UserRole } from "@/lib/types";

interface VotingGridProps {
  pollId: string;
  nominations: Nomination[];
  userId: string;
  userRole: UserRole;
  hasVoted: boolean;
}

export function VotingGrid({
  pollId,
  nominations,
  userId,
  userRole,
  hasVoted: initialHasVoted,
}: VotingGridProps) {
  const supabase = createClient();
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVote = async (nominationId: string) => {
    if (userRole !== "voter") {
      setError("Only voters can cast votes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: voteError } = await supabase.from("votes").insert({
        poll_id: pollId,
        nomination_id: nominationId,
        user_id: userId,
      });

      if (voteError) {
        if (voteError.code === "23505") {
          setError("You have already voted in this poll.");
          setHasVoted(true);
        } else {
          throw voteError;
        }
        return;
      }

      setHasVoted(true);
      setVotedFor(nominationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  if (nominations.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-400">No approved nominations yet.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {hasVoted && !votedFor && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          You have already voted in this poll.
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nominations.map((nomination, index) => (
          <motion.div
            key={nomination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
              {nomination.image_url && (
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <Image
                    src={nomination.image_url}
                    alt={nomination.nominee_name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="mb-3 text-lg font-semibold">
                  {nomination.nominee_name}
                </h3>
                {votedFor === nomination.id ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Voted!</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleVote(nomination.id)}
                    disabled={hasVoted || loading || userRole !== "voter"}
                    size="sm"
                    className="w-full"
                  >
                    <Vote className="mr-1 h-4 w-4" />
                    {hasVoted ? "Already Voted" : "Vote"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
