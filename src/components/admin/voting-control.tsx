"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POLL_STATUS_LABELS, POLL_STATUS_COLORS } from "@/lib/constants";
import type { Poll } from "@/lib/types";
import { Play, Square } from "lucide-react";

interface VotingControlProps {
  initialPolls: Poll[];
}

export function VotingControl({ initialPolls }: VotingControlProps) {
  const supabase = createClient();
  const router = useRouter();
  const [polls, setPolls] = useState(initialPolls);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (pollId: string, status: string) => {
    setLoading(pollId);
    setError(null);

    const { error: updateError } = await supabase
      .from("polls")
      .update({ status })
      .eq("id", pollId);

    if (updateError) {
      setError(`Failed to update poll status: ${updateError.message}`);
    } else {
      setPolls(polls.map((p) => (p.id === pollId ? { ...p, status: status as Poll["status"] } : p)));
      router.refresh();
    }
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {polls.length === 0 && (
        <p className="py-12 text-center text-neutral-400">No polls available.</p>
      )}
      {polls.map((poll) => (
        <Card key={poll.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold">{poll.title}</h3>
              <Badge className={POLL_STATUS_COLORS[poll.status]} variant="secondary">
                {POLL_STATUS_LABELS[poll.status]}
              </Badge>
            </div>
            <div className="flex gap-2">
              {(poll.status === "NOMINATION_CLOSED" || poll.status === "NOMINATION_OPEN") && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(poll.id, "VOTING_OPEN")}
                  disabled={loading === poll.id}
                >
                  <Play className="mr-1 h-4 w-4" />
                  Open Voting
                </Button>
              )}
              {poll.status === "VOTING_OPEN" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateStatus(poll.id, "VOTING_CLOSED")}
                  disabled={loading === poll.id}
                >
                  <Square className="mr-1 h-4 w-4" />
                  Close Voting
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
