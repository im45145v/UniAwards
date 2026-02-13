"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { BarChart3, Users, Vote, Trophy } from "lucide-react";

interface AnalyticsDashboardProps {
  pollCount: number;
  nominationCount: number;
  voteCount: number;
  userCount: number;
  polls: Array<{ id: string; title: string }>;
  votes: Array<{ poll_id: string }>;
}

export function AnalyticsDashboard({
  pollCount,
  nominationCount,
  voteCount,
  userCount,
  polls,
  votes,
}: AnalyticsDashboardProps) {
  const stats = [
    { label: "Total Polls", value: pollCount, icon: BarChart3 },
    { label: "Total Nominations", value: nominationCount, icon: Trophy },
    { label: "Total Votes", value: voteCount, icon: Vote },
    { label: "Total Users", value: userCount, icon: Users },
  ];

  // Votes per poll chart data
  const votesPerPoll = polls.map((poll) => ({
    name: poll.title.length > 20 ? poll.title.substring(0, 20) + "…" : poll.title,
    votes: votes.filter((v) => v.poll_id === poll.id).length,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {votesPerPoll.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Votes per Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votesPerPoll}>
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
      )}
    </div>
  );
}
