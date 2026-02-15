"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Poll, NominationWithVotes } from "@/lib/types";

interface PollWithLeaderboard extends Poll {
  nominations: NominationWithVotes[];
  totalVotes: number;
}

interface PublicLeaderboardContentProps {
  polls: PollWithLeaderboard[];
}

export function PublicLeaderboardContent({ polls }: PublicLeaderboardContentProps) {
  const [expandedPolls, setExpandedPolls] = useState<Set<string>>(new Set());

  const togglePoll = (pollId: string) => {
    setExpandedPolls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pollId)) {
        newSet.delete(pollId);
      } else {
        newSet.add(pollId);
      }
      return newSet;
    });
  };

  if (polls.length === 0) {
    return (
      <div className="py-20 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
        <p className="text-neutral-400">No polls available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const isExpanded = expandedPolls.has(poll.id);
        const topNominations = poll.nominations.slice(0, 3);

        return (
          <Card key={poll.id} className="overflow-hidden">
            <div className="border-b border-neutral-100 bg-neutral-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{poll.title}</h2>
                  {poll.description && (
                    <p className="mt-1 text-neutral-600">{poll.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700">
                      {poll.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {poll.totalVotes} total votes
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePoll(poll.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Top 3 Preview when collapsed */}
              {!isExpanded && topNominations.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {topNominations.map((nomination, index) => (
                    <div
                      key={nomination.id}
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold">
                        {index === 0 ? (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Medal className="h-4 w-4 text-amber-700" />
                        )}
                      </div>
                      {nomination.image_url && (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                          <Image
                            src={nomination.image_url}
                            alt={nomination.nominee_name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {nomination.nominee_name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({nomination.vote_count} votes)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full Leaderboard when expanded */}
            {isExpanded && (
              <CardContent className="p-6">
                {poll.nominations.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400">
                    No nominations yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {poll.nominations.map((nomination, index) => {
                      const percentage =
                        poll.totalVotes > 0
                          ? (nomination.vote_count / poll.totalVotes) * 100
                          : 0;

                      return (
                        <motion.div
                          key={nomination.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                        >
                          <Card className="overflow-hidden">
                            <CardContent className="flex items-center gap-4 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold">
                                {index === 0 ? (
                                  <Trophy className="h-5 w-5 text-yellow-500" />
                                ) : index < 3 ? (
                                  <Medal className="h-5 w-5 text-neutral-400" />
                                ) : (
                                  <span className="text-sm text-neutral-500">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              {nomination.image_url && (
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                                  <Image
                                    src={nomination.image_url}
                                    alt={nomination.nominee_name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold">
                                  {nomination.nominee_name}
                                </p>
                                <div className="mt-1 flex items-center gap-3">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                    <motion.div
                                      className="h-full rounded-full bg-neutral-900"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{
                                        duration: 0.8,
                                        delay: index * 0.05,
                                      }}
                                    />
                                  </div>
                                  <span className="shrink-0 text-sm text-neutral-500">
                                    {nomination.vote_count}{" "}
                                    {nomination.vote_count === 1 ? "vote" : "votes"}
                                    {poll.totalVotes > 0 && ` (${percentage.toFixed(1)}%)`}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
