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
import { Plus, Pencil, Save, X, Calendar, Clock, Timer } from "lucide-react";

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
  const [endsAt, setEndsAt] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateEndsAt = (): string | null => {
    if (endsAt) {
      return new Date(endsAt).toISOString();
    }
    if (duration) {
      const hours = parseInt(duration, 10);
      if (!isNaN(hours) && hours > 0) {
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + hours);
        return endDate.toISOString();
      }
    }
    return null;
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const calculatedEndsAt = calculateEndsAt();

    const { data, error: createError } = await supabase
      .from("polls")
      .insert({ 
        title: title.trim(), 
        description: description.trim(), 
        status,
        ends_at: calculatedEndsAt
      })
      .select()
      .single();

    if (createError) {
      setError(`Failed to create poll: ${createError.message}`);
    } else if (data) {
      setPolls([data as Poll, ...polls]);
      resetForm();
      setShowCreate(false);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("NOMINATION_OPEN");
    setEndsAt("");
    setDuration("");
  };

  const startEdit = (poll: Poll) => {
    setEditingId(poll.id);
    setTitle(poll.title);
    setDescription(poll.description || "");
    setStatus(poll.status);
    setEndsAt(poll.ends_at ? new Date(poll.ends_at).toISOString().slice(0, 16) : "");
    setDuration("");
  };

  const handleUpdate = async (pollId: string) => {
    setLoading(true);
    setError(null);

    const calculatedEndsAt = calculateEndsAt();

    const { error: updateError } = await supabase
      .from("polls")
      .update({ 
        title: title.trim(), 
        description: description.trim(), 
        status,
        ends_at: calculatedEndsAt
      })
      .eq("id", pollId);

    if (updateError) {
      setError(`Failed to update poll: ${updateError.message}`);
    } else {
      setPolls(
        polls.map((p) =>
          p.id === pollId
            ? { ...p, title: title.trim(), description: description.trim(), status, ends_at: calculatedEndsAt }
            : p
        )
      );
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  };

  const formatEndsAt = (endsAt: string | null) => {
    if (!endsAt) return null;
    const date = new Date(endsAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "< 1h left";
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-gradient-to-r from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Poll
        </Button>
      </div>

      {showCreate && (
        <Card className="border-2 border-dashed border-neutral-300 bg-neutral-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Poll
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Best Smile Award"
                  className="text-lg"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe this award..."
                  rows={3}
                />
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Voting End Date/Time
                </Label>
                <Input 
                  type="datetime-local" 
                  value={endsAt}
                  onChange={(e) => {
                    setEndsAt(e.target.value);
                    setDuration("");
                  }}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Or set duration (hours from now)
                </Label>
                <div className="flex gap-2">
                  {[1, 6, 12, 24, 48, 72].map((h) => (
                    <Button
                      key={h}
                      type="button"
                      variant={duration === String(h) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setDuration(String(h));
                        setEndsAt("");
                      }}
                    >
                      {h}h
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleCreate} 
                disabled={loading || !title.trim()}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500"
              >
                {loading ? "Creating..." : "Create Poll"}
              </Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {polls.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
            <p className="text-neutral-400">No polls yet. Create your first poll!</p>
          </div>
        )}
        {polls.map((poll) => (
          <Card key={poll.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              {editingId === poll.id ? (
                <div className="space-y-4">
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Poll title"
                    className="text-lg font-semibold"
                  />
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onChange={(e) => setStatus(e.target.value as PollStatus)}>
                        <option value="NOMINATION_OPEN">Nominations Open</option>
                        <option value="NOMINATION_CLOSED">Nominations Closed</option>
                        <option value="VOTING_OPEN">Voting Open</option>
                        <option value="VOTING_CLOSED">Voting Closed</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Voting End Date/Time
                      </Label>
                      <Input 
                        type="datetime-local" 
                        value={endsAt}
                        onChange={(e) => {
                          setEndsAt(e.target.value);
                          setDuration("");
                        }}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Or set duration (hours from now)
                      </Label>
                      <div className="flex gap-2">
                        {[1, 6, 12, 24, 48, 72].map((h) => (
                          <Button
                            key={h}
                            type="button"
                            variant={duration === String(h) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setDuration(String(h));
                              setEndsAt("");
                            }}
                          >
                            {h}h
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" onClick={() => handleUpdate(poll.id)} disabled={loading}>
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(null); resetForm(); }}>
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-sm text-neutral-500">{poll.description}</p>
                    )}
                    {poll.ends_at && (
                      <p className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {formatEndsAt(poll.ends_at)}
                      </p>
                    )}
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
