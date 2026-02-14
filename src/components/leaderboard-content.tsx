"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { NominationWithVotes } from "@/lib/types";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardContentProps {
  nominations: NominationWithVotes[];
}

export function LeaderboardContent({ nominations }: LeaderboardContentProps) {
  const totalVotes = nominations.reduce((sum, n) => sum + n.vote_count, 0);

  if (nominations.length === 0) {
    return (
      <div className="py-20 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
        <p className="text-neutral-400">No results available yet.</p>
      </div>
    );
  }

  const chartData = nominations.slice(0, 10).map((n) => ({
    name: n.nominee_name.length > 15 ? n.nominee_name.substring(0, 15) + "…" : n.nominee_name,
    votes: n.vote_count,
  }));

  return (
    <div className="space-y-8">
      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Vote Distribution</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#171717" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <div className="space-y-4">
        {nominations.map((nomination, index) => {
          const percentage = totalVotes > 0 ? (nomination.vote_count / totalVotes) * 100 : 0;

          return (
            <motion.div
              key={nomination.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : index < 3 ? (
                      <Medal className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <span className="text-sm text-neutral-500">{index + 1}</span>
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
                    <p className="font-semibold">{nomination.nominee_name}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <motion.div
                          className="h-full rounded-full bg-neutral-900"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="shrink-0 text-sm text-neutral-500">
                        {nomination.vote_count} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
