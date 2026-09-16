"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LeadScore } from "@/components/leads/lead-score";
import { createClient } from "@/lib/supabase/client";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  type LeadStage,
  type LeadPriority,
  type ProjectType,
} from "@/lib/leads/constants";
import type { LeadDetail } from "@/components/leads/types";

export function LeadOverview({
  lead,
  canManage,
  sources,
  profiles,
}: {
  lead: LeadDetail;
  canManage: boolean;
  sources: { id: string; name: string }[];
  profiles: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<LeadStage>(lead.stage as LeadStage);
  const [priority, setPriority] = useState<LeadPriority>(lead.priority as LeadPriority);
  const [projectType, setProjectType] = useState<ProjectType>(lead.project_type as ProjectType);
  const [ownerId, setOwnerId] = useState(lead.owner_id ?? "none");
  const [sourceId, setSourceId] = useState(lead.source_id ?? "none");
  const [capacity, setCapacity] = useState(lead.estimated_capacity_kwp?.toString() ?? "");
  const [value, setValue] = useState(lead.estimated_value?.toString() ?? "");
  const [closeDate, setCloseDate] = useState(lead.expected_close_date ?? "");
  const [nextAction, setNextAction] = useState(lead.next_action ?? "");
  const [nextActionDate, setNextActionDate] = useState(lead.next_action_date ?? "");
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const stageChanged = stage !== lead.stage;

    const { error } = await supabase
      .from("leads")
      .update({
        stage,
        priority,
        project_type: projectType,
        owner_id: ownerId === "none" ? null : ownerId,
        source_id: sourceId === "none" ? null : sourceId,
        estimated_capacity_kwp: capacity ? Number(capacity) : null,
        estimated_value: value ? Number(value) : null,
        expected_close_date: closeDate || null,
        next_action: nextAction || null,
        next_action_date: nextActionDate || null,
        lost_reason: stage === "lost" ? lostReason || null : null,
      })
      .eq("id", lead.id);

    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    if (stageChanged) {
      await supabase.from("lead_activities").insert({
        lead_id: lead.id,
        activity_type: "stage_change",
        description: `Stage changed from ${LEAD_STAGE_LABELS[lead.stage as LeadStage]} to ${LEAD_STAGE_LABELS[stage]}`,
      });
    }

    setSaving(false);
    toast.success("Lead updated");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Status</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => v && setStage(v as LeadStage)} disabled={!canManage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_STAGE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v as LeadPriority)} disabled={!canManage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {LEAD_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={ownerId ?? "none"} onValueChange={(v) => v && setOwnerId(v)} disabled={!canManage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {stage === "lost" && (
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="lost_reason">Lost reason</Label>
              <Input id="lost_reason" value={lostReason} onChange={(e) => setLostReason(e.target.value)} disabled={!canManage} />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Classification & commercial</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project type</Label>
              <Select value={projectType} onValueChange={(v) => v && setProjectType(v as ProjectType)} disabled={!canManage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROJECT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={sourceId ?? "none"} onValueChange={(v) => v && setSourceId(v)} disabled={!canManage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unspecified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unspecified</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Est. capacity (kWp)</Label>
              <Input id="capacity" type="number" step="0.1" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Est. value (₹)</Label>
              <Input id="value" type="number" step="1000" value={value} onChange={(e) => setValue(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="close_date">Expected close</Label>
              <Input id="close_date" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} disabled={!canManage} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Next action</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="next_action">Action</Label>
              <Input id="next_action" value={nextAction} onChange={(e) => setNextAction(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next_action_date">Due date</Label>
              <Input id="next_action_date" type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} disabled={!canManage} />
            </div>
          </div>
        </div>

        {canManage && (
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        )}
      </div>

      <div>
        <LeadScore lead={lead} />
      </div>
    </div>
  );
}
