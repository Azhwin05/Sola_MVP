"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS, type ActivityType } from "@/lib/leads/constants";
import type { Tables } from "@/lib/types/database";

type Activity = Tables<"lead_activities"> & { actor: { full_name: string } | null };

export function LeadActivityTab({
  leadId,
  activities,
  canManage,
}: {
  leadId: string;
  activities: Activity[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState<ActivityType>("call");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function addActivity() {
    if (!description.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("lead_activities").insert({
      lead_id: leadId,
      activity_type: type,
      description: description.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDescription("");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      {canManage && (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Select value={type} onValueChange={(v) => v && setType(v as ActivityType)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.filter((t) => t !== "stage_change").map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACTIVITY_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened?"
            rows={2}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={addActivity} disabled={saving || !description.trim()}>
              {saving ? "Logging…" : "Log activity"}
            </Button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No activity yet" description="Calls, emails, meetings and stage changes will show up here." />
      ) : (
        <ol className="space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex gap-3">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <div className="min-w-0 flex-1 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {ACTIVITY_TYPE_LABELS[a.activity_type as ActivityType] ?? a.activity_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {a.actor?.full_name ?? "System"} ·{" "}
                    {new Date(a.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{a.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
