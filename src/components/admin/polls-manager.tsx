"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POLL_STATUS_LABELS, POLL_STATUS_COLORS } from "@/lib/constants";
import type { Poll, PollStatus } from "@/lib/types";
import { Plus, Pencil, Save, X } from "lucide-react";

interface PollsManagerProps {
  initialPolls: Poll[];
}

export function PollsManager({ initialPolls }: PollsManagerProps) {
  const supabase = createClient();
  const router = useRouter();
  const [polls, setPolls] = useState(initialPolls);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PollStatus>("NOMINATION_OPEN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const { data, error: createError } = await supabase
      .from("polls")
      .insert({ title: title.trim(), description: description.trim(), status })
      .select()
      .single();

    if (createError) {
      setError(`Failed to create poll: ${createError.message}`);
    } else if (data) {
      setPolls([data as Poll, ...polls]);
      setTitle("");
      setDescription("");
      setStatus("NOMINATION_OPEN");
      setShowCreate(false);
    }
    setLoading(false);
  };

  const startEdit = (poll: Poll) => {
    setEditingId(poll.id);
    setTitle(poll.title);
    setDescription(poll.description || "");
    setStatus(poll.status);
  };

  const handleUpdate = async (pollId: string) => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("polls")
      .update({ title: title.trim(), description: description.trim(), status })
      .eq("id", pollId);

    if (updateError) {
      setError(`Failed to update poll: ${updateError.message}`);
    } else {
      setPolls(
        polls.map((p) =>
          p.id === pollId
            ? { ...p, title: title.trim(), description: description.trim(), status }
            : p
        )
      );
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Poll
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Poll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Award title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as PollStatus)}>
                <option value="NOMINATION_OPEN">Nominations Open</option>
                <option value="NOMINATION_CLOSED">Nominations Closed</option>
                <option value="VOTING_OPEN">Voting Open</option>
                <option value="VOTING_CLOSED">Voting Closed</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading || !title.trim()}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardContent className="p-6">
              {editingId === poll.id ? (
                <div className="space-y-4">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  <Select value={status} onChange={(e) => setStatus(e.target.value as PollStatus)}>
                    <option value="NOMINATION_OPEN">Nominations Open</option>
                    <option value="NOMINATION_CLOSED">Nominations Closed</option>
                    <option value="VOTING_OPEN">Voting Open</option>
                    <option value="VOTING_CLOSED">Voting Closed</option>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(poll.id)} disabled={loading}>
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{poll.title}</h3>
                    <p className="text-sm text-neutral-500">{poll.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={POLL_STATUS_COLORS[poll.status]} variant="secondary">
                      {POLL_STATUS_LABELS[poll.status]}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => startEdit(poll)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
