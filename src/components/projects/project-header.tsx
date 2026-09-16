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
      <p className="text-xs font-medium text-muted-foreground">{project.project_number}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{project.customer?.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canManage ? (
          <Select value={project.status} onValueChange={(v) => v && changeStatus(v as ProjectStatus)}>
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
          <StatusBadge status={health} />
        </span>
        <span className="text-sm text-muted-foreground">
          {project.capacity_kwp ? `${project.capacity_kwp.toFixed(1)} kWp` : "Capacity TBD"}
        </span>
        {project.pm && <span className="text-sm text-muted-foreground">PM: {project.pm.full_name}</span>}
        {project.target_cod && (
          <span className="text-sm text-muted-foreground">
            Target COD: {new Date(project.target_cod).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
        {milestones.length > 0 && <span className="text-sm text-muted-foreground">Installation {progressPercent}%</span>}
      </div>
    </div>
  );
}
