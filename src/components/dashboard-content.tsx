"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { POLL_STATUS_LABELS, POLL_STATUS_COLORS } from "@/lib/constants";
import type { Poll } from "@/lib/types";
import { Trophy, Vote, Users } from "lucide-react";

interface DashboardContentProps {
  polls: Poll[];
}

export function DashboardContent({ polls }: DashboardContentProps) {
  if (polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy className="mb-4 h-16 w-16 text-neutral-300" />
        <h2 className="mb-2 text-xl font-semibold text-neutral-600">No Awards Yet</h2>
        <p className="text-neutral-400">Check back soon for yearbook award polls!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll, index) => (
        <motion.div
          key={poll.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="group transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                <Badge className={POLL_STATUS_COLORS[poll.status]} variant="secondary">
                  {POLL_STATUS_LABELS[poll.status]}
                </Badge>
              </div>
              <CardDescription>{poll.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {poll.status === "NOMINATION_OPEN" && (
                  <Link href={`/nominate/${poll.id}`}>
                    <Button size="sm">
                      <Users className="mr-1 h-4 w-4" />
                      Nominate
                    </Button>
                  </Link>
                )}
                {poll.status === "VOTING_OPEN" && (
                  <Link href={`/vote/${poll.id}`}>
                    <Button size="sm">
                      <Vote className="mr-1 h-4 w-4" />
                      Vote
                    </Button>
                  </Link>
                )}
                {poll.status === "VOTING_CLOSED" && (
                  <Link href={`/leaderboard/${poll.id}`}>
                    <Button size="sm" variant="secondary">
                      <Trophy className="mr-1 h-4 w-4" />
                      Results
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
