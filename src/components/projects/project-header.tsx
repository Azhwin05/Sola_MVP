"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { calculateProjectHealth } from "@/lib/projects/health";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/projects/constants";
import { createClient } from "@/lib/supabase/client";
import type { ProjectWithRelations, MilestoneRow, TaskRow, RiskRow } from "@/components/projects/types";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
      <span className="text-subtle">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

export function ProjectHeader({
  project,
  milestones,
  tasks,
  risks,
  canManage,
}: {
  project: ProjectWithRelations;
  milestones: MilestoneRow[];
  tasks: TaskRow[];
  risks: RiskRow[];
  profiles: { id: string; full_name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [changing, setChanging] = useState(false);
  const today = new Date(new Date().toDateString());

  const overdueTaskCount = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < today && !["done", "cancelled"].includes(t.status),
  ).length;
  const openRisks = risks.filter((r) => r.status === "open") as { impact: "low" | "medium" | "high" }[];
  const { health, reasons } = calculateProjectHealth({
    status: project.status as ProjectStatus,
    targetCod: project.target_cod,
    overdueTaskCount,
    openRisks,
  });
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  async function changeStatus(status: ProjectStatus) {
    setChanging(true);
    const supabase = createClient();
    const { error } = await supabase.from("projects").update({ status }).eq("id", project.id);
    if (!error) {
      await supabase.from("project_events").insert({
        project_id: project.id,
        event: `Status changed to ${PROJECT_STATUS_LABELS[status]}`,
      });
    }
    setChanging(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="font-mono text-xs font-medium tracking-wide text-subtle">{project.project_number}</p>
      <h1 className="mt-0.5 text-[22px] leading-tight font-semibold tracking-tight text-foreground">
        {project.customer?.name}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canManage ? (
          <Select
            items={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))}
            value={project.status}
            onValueChange={(v) => v && changeStatus(v as ProjectStatus)}
          >
            <SelectTrigger size="sm" disabled={changing} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={project.status} />
        )}
        <span title={reasons.join("; ")}>
          <StatusBadge status={health === "at_risk" ? "At Risk" : health} />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted-foreground">
        <Meta label="Capacity" value={project.capacity_kwp ? `${project.capacity_kwp.toFixed(1)} kWp` : "TBD"} />
        {project.pm && <Meta label="PM" value={project.pm.full_name} />}
        {project.target_cod && (
          <Meta
            label="Target COD"
            value={new Date(project.target_cod).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          />
        )}
      </div>

      {milestones.length > 0 && (
        <div className="mt-4 max-w-md">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-muted-foreground">Installation progress</span>
            <span className="font-semibold tabular-nums text-foreground">{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-subtle">
            {completedMilestones} of {milestones.length} milestones completed
          </p>
        </div>
      )}
    </div>
  );
}
