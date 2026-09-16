"use client";

import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateProjectHealth } from "@/lib/projects/health";
import type { ProjectStatus } from "@/lib/projects/constants";
import type { Tables } from "@/lib/types/database";

type ProjectRow = Tables<"projects"> & {
  customer: { id: string; name: string } | null;
  pm: { id: string; full_name: string } | null;
  tasks: { status: string; due_date: string | null }[];
  risks: { impact: string; status: string }[];
};

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Projects are created automatically when a proposal is accepted, or you can start one manually."
      />
    );
  }

  const today = new Date(new Date().toDateString());

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>PM</TableHead>
            <TableHead className="text-right">Capacity</TableHead>
            <TableHead>Target COD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => {
            const overdueTaskCount = p.tasks.filter(
              (t) => t.due_date && new Date(t.due_date) < today && !["done", "cancelled"].includes(t.status),
            ).length;
            const openRisks = p.risks.filter((r) => r.status === "open") as { impact: "low" | "medium" | "high" }[];
            const { health } = calculateProjectHealth({
              status: p.status as ProjectStatus,
              targetCod: p.target_cod,
              overdueTaskCount,
              openRisks,
            });
            return (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
                <TableCell className="font-medium text-foreground">{p.project_number}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.customer?.name ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={health} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.pm?.full_name ?? "Unassigned"}</TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {p.capacity_kwp ? `${p.capacity_kwp.toFixed(1)} kWp` : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.target_cod ? new Date(p.target_cod).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
