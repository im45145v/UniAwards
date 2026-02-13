"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { NominationWithUser } from "@/lib/types";
import { Check, X } from "lucide-react";

interface NominationsManagerProps {
  initialNominations: NominationWithUser[];
}

export function NominationsManager({ initialNominations }: NominationsManagerProps) {
  const supabase = createClient();
  const router = useRouter();
  const [nominations, setNominations] = useState(initialNominations);

  const handleApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("nominations")
      .update({ approved })
      .eq("id", id);

    if (!error) {
      setNominations(
        nominations.map((n) => (n.id === id ? { ...n, approved } : n))
      );
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {nominations.length === 0 && (
        <p className="col-span-full py-12 text-center text-neutral-400">
          No nominations yet.
        </p>
      )}
      {nominations.map((nomination, index) => (
        <motion.div
          key={nomination.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden">
            {nomination.image_url && (
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={nomination.image_url}
                  alt={nomination.nominee_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{nomination.nominee_name}</h3>
                <Badge variant={nomination.approved ? "default" : "secondary"}>
                  {nomination.approved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <p className="mb-3 text-xs text-neutral-400">
                Nominated by: {nomination.users?.email || "Unknown"}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApproval(nomination.id, true)}
                  disabled={nomination.approved}
                  className="flex-1"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleApproval(nomination.id, false)}
                  disabled={!nomination.approved}
                  className="flex-1"
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
