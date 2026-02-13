"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, Upload } from "lucide-react";

interface NominationFormProps {
  pollId: string;
  userId: string;
}

export function NominationForm({ pollId, userId }: NominationFormProps) {
  const supabase = createClient();
  const [nomineeName, setNomineeName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim()) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${pollId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("nominations")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("nominations")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("nominations").insert({
        poll_id: pollId,
        nominee_name: nomineeName.trim(),
        image_url: imageUrl,
        nominated_by_user_id: userId,
      });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="text-center">
          <CardContent className="py-12">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold">Nomination Submitted!</h2>
            <p className="text-neutral-500">
              Your nomination is pending admin approval.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>Submit a Nomination</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nominee-name">Nominee Name</Label>
              <Input
                id="nominee-name"
                placeholder="Enter nominee's name"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nominee-image">Photo (optional)</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="nominee-image"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-600"
                >
                  <Upload className="h-4 w-4" />
                  {file ? file.name : "Choose an image"}
                </label>
                <input
                  id="nominee-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" disabled={loading || !nomineeName.trim()}>
              {loading ? "Submitting..." : "Submit Nomination"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
