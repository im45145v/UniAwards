"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Vote, Sparkles, Timer, AlertCircle } from "lucide-react";
import type { NominationWithVotes, UserRole } from "@/lib/types";

interface VotingGridProps {
  pollId: string;
  nominations: NominationWithVotes[];
  userId: string;
  userRole: UserRole;
  hasVoted: boolean;
  endsAt: string | null;
}

export function VotingGrid({
  pollId,
  nominations: initialNominations,
  userId,
  userRole,
  hasVoted: initialHasVoted,
  endsAt,
}: VotingGridProps) {
  const supabase = createClient();
  const [nominations, setNominations] = useState(initialNominations);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  const totalVotes = nominations.reduce((sum, n) => sum + n.vote_count, 0);

  // Countdown timer
  useEffect(() => {
    if (!endsAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Voting ended");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  // Real-time subscription for votes
  useEffect(() => {
    const channel = supabase
      .channel(`votes:${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          const nominationId = payload.new.nomination_id;
          setNominations((prev) =>
            prev.map((n) =>
              n.id === nominationId ? { ...n, vote_count: n.vote_count + 1 } : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, pollId]);

  const handleVote = async (nominationId: string) => {
    if (userRole !== "voter" && userRole !== "admin") {
      setError("Only voters can cast votes.");
      return;
    }

    if (isExpired) {
      setError("Voting has ended for this poll.");
      return;
    }

    setLoading(nominationId);
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
      setLoading(null);
    }
  };

  if (nominations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-neutral-100 p-6">
          <Vote className="h-12 w-12 text-neutral-400" />
        </div>
        <p className="mt-4 text-lg text-neutral-500">No approved nominations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="font-medium">{totalVotes} total votes</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-400" />
            <span className="font-medium">{nominations.length} nominees</span>
          </div>
        </div>
        {endsAt && (
          <Badge 
            variant="secondary" 
            className={`${isExpired ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'} border-0 px-3 py-1`}
          >
            <Timer className="mr-2 h-4 w-4" />
            {isExpired ? "Voting ended" : `Ends in ${timeLeft}`}
          </Badge>
        )}
      </div>

      {/* Error/Success messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
        {hasVoted && !votedFor && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="font-medium">You have already voted in this poll.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nominations.map((nomination, index) => {
          const percentage = totalVotes > 0 ? (nomination.vote_count / totalVotes) * 100 : 0;
          const isVotedFor = votedFor === nomination.id;

          return (
            <motion.div
              key={nomination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`group overflow-hidden transition-all duration-300 ${
                isVotedFor 
                  ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'hover:shadow-xl hover:-translate-y-1'
              }`}>
                {nomination.image_url && (
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                    <Image
                      src={nomination.image_url}
                      alt={nomination.nominee_name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Live vote count overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">{nomination.vote_count} votes</span>
                        <span className="text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/30">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="mb-3 text-lg font-bold text-neutral-900">
                    {nomination.nominee_name}
                  </h3>
                  {isVotedFor ? (
                    <motion.div 
                      initial={{ scale: 0.8 }} 
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2 text-white"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold">Voted!</span>
                    </motion.div>
                  ) : (
                    <Button
                      onClick={() => handleVote(nomination.id)}
                      disabled={hasVoted || loading !== null || (userRole !== "voter" && userRole !== "admin") || isExpired}
                      className="w-full bg-gradient-to-r from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 transition-all duration-300"
                    >
                      {loading === nomination.id ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Voting...
                        </span>
                      ) : (
                        <>
                          <Vote className="mr-2 h-4 w-4" />
                          {hasVoted ? "Already Voted" : isExpired ? "Voting Ended" : "Vote"}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
