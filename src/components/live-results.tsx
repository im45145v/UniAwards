"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Users, Timer, Flame } from "lucide-react";
import type { NominationWithVotes } from "@/lib/types";

interface LiveResultsProps {
  pollId: string;
  initialNominations: NominationWithVotes[];
  endsAt: string | null;
  showFullChart?: boolean;
}

export function LiveResults({ 
  pollId, 
  initialNominations, 
  endsAt,
  showFullChart = false 
}: LiveResultsProps) {
  const supabase = createClient();
  const [nominations, setNominations] = useState(initialNominations);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  const totalVotes = nominations.reduce((sum, n) => sum + n.vote_count, 0);
  const sortedNominations = [...nominations].sort((a, b) => b.vote_count - a.vote_count);
  const leader = sortedNominations[0];

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

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-2xl">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Live Results
          </CardTitle>
          <div className="flex items-center gap-3">
            {endsAt && (
              <Badge 
                variant="secondary" 
                className={`${isExpired ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'} border-0`}
              >
                <Timer className="mr-1 h-3 w-3" />
                {timeLeft}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/10 text-white border-0">
              <Users className="mr-1 h-3 w-3" />
              {totalVotes} votes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {nominations.length === 0 ? (
          <p className="text-center text-neutral-400">No nominations yet.</p>
        ) : (
          <div className="space-y-4">
            {/* Leader highlight */}
            {leader && leader.vote_count > 0 && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {leader.image_url ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-amber-400">
                        <Image
                          src={leader.image_url}
                          alt={leader.nominee_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 ring-2 ring-amber-400">
                        <Trophy className="h-8 w-8 text-amber-400" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
                      <Flame className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                      Currently Leading
                    </p>
                    <p className="text-xl font-bold">{leader.nominee_name}</p>
                    <p className="text-sm text-neutral-400">
                      {leader.vote_count} votes ({totalVotes > 0 ? ((leader.vote_count / totalVotes) * 100).toFixed(1) : 0}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All nominees with progress bars */}
            <AnimatePresence mode="popLayout">
              {sortedNominations.map((nomination, index) => {
                const percentage = totalVotes > 0 ? (nomination.vote_count / totalVotes) * 100 : 0;
                const isLeader = index === 0 && nomination.vote_count > 0;

                return (
                  <motion.div
                    key={nomination.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      {nomination.image_url && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                          <Image
                            src={nomination.image_url}
                            alt={nomination.nominee_name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isLeader ? 'text-amber-300' : ''}`}>
                            {nomination.nominee_name}
                          </span>
                          <span className="text-sm text-neutral-400">
                            {nomination.vote_count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className={`h-full rounded-full ${isLeader ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
