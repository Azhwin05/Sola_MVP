"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { RISK_LEVELS, type RiskLevel } from "@/lib/projects/constants";
import type { ProjectWithRelations, MilestoneRow, RiskRow } from "@/components/projects/types";

export function ProjectOverviewTab({
  project,
  milestones,
  risks,
  profiles,
  canManage,
}: {
  project: ProjectWithRelations;
  milestones: MilestoneRow[];
  risks: RiskRow[];
  profiles: { id: string; full_name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const nextMilestone = milestones.find((m) => m.status !== "completed" && m.status !== "skipped");
  const openRisks = risks.filter((r) => r.status === "open");

  async function resolveRisk(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("project_risks").update({ status: "mitigated" }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Contract Value" value={project.contract_value ? `₹${project.contract_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"} />
        <StatCard label="Collected" value="—" />
        <StatCard label="Cost" value="—" />
        <StatCard label="Margin" value="—" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Next Action</h3>
          {nextMilestone ? (
            <p className="text-sm text-foreground">
              Complete <span className="font-medium">{nextMilestone.name}</span>
              {nextMilestone.owner && <span className="text-muted-foreground"> · {nextMilestone.owner.full_name}</span>}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">All milestones complete.</p>
          )}
        </section>

        <section className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Blockers</h3>
            {canManage && (
              <Button size="xs" variant="ghost" onClick={() => setRiskDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add risk
              </Button>
            )}
          </div>
          {openRisks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open risks.</p>
          ) : (
            <ul className="space-y-2">
              {openRisks.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm text-foreground">{r.risk}</p>
                      <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="mr-1 text-[10px]">
                          {r.impact} impact
                        </Badge>
                        {r.mitigation}
                      </p>
                    </div>
                  </div>
                  {canManage && (
                    <Button size="xs" variant="ghost" onClick={() => resolveRisk(r.id)}>
                      Resolve
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Milestones</h3>
        <ol className="space-y-1.5">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span className={m.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}>
                {m.name}
              </span>
              <Badge variant={m.status === "completed" ? "secondary" : "outline"} className="text-[10px] capitalize">
                {m.status.replace("_", " ")}
              </Badge>
            </li>
          ))}
        </ol>
      </section>

      <AddRiskDialog projectId={project.id} profiles={profiles} open={riskDialogOpen} onOpenChange={setRiskDialogOpen} onCreated={() => router.refresh()} />
    </div>
  );
}

function AddRiskDialog({
  projectId,
  profiles,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  profiles: { id: string; full_name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [risk, setRisk] = useState("");
  const [impact, setImpact] = useState<RiskLevel>("medium");
  const [probability, setProbability] = useState<RiskLevel>("medium");
  const [mitigation, setMitigation] = useState("");
  const [ownerId, setOwnerId] = useState("none");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!risk.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("project_risks").insert({
      project_id: projectId,
      risk: risk.trim(),
      impact,
      probability,
      mitigation: mitigation || null,
      owner_id: ownerId === "none" ? null : ownerId,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRisk("");
    setMitigation("");
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add risk</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="risk">Risk</Label>
            <Input id="risk" value={risk} onChange={(e) => setRisk(e.target.value)} placeholder="Inverter delivery delay" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Impact</Label>
              <Select value={impact} onValueChange={(v) => v && setImpact(v as RiskLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Probability</Label>
              <Select value={probability} onValueChange={(v) => v && setProbability(v as RiskLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mitigation">Mitigation</Label>
            <Textarea id="mitigation" rows={2} value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={ownerId} onValueChange={(v) => v && setOwnerId(v)}>
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
        <DialogFooter>
          <Button onClick={save} disabled={saving || !risk.trim()}>
            {saving ? "Adding…" : "Add risk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
