import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";

const ROWS: { key: "healthy" | "at_risk" | "delayed" | "blocked"; label: string; barClass: string }[] = [
  { key: "healthy", label: "On Track", barClass: "bg-success" },
  { key: "at_risk", label: "At Risk", barClass: "bg-warning" },
  { key: "delayed", label: "Delayed", barClass: "bg-destructive" },
  { key: "blocked", label: "Blocked", barClass: "bg-destructive" },
];

export function ProjectHealthSummary({
  counts,
}: {
  counts: Record<"healthy" | "at_risk" | "delayed" | "blocked", number>;
}) {
  const total = counts.healthy + counts.at_risk + counts.delayed + counts.blocked;

  if (total === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No active projects yet"
        description="Project health will appear here once a proposal is accepted or a project is created."
      />
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      {ROWS.map((row) => {
        const count = counts[row.key];
        const percent = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={row.key} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
            <div className="h-3 flex-1 rounded-full bg-muted">
              <div className={`h-3 rounded-full ${row.barClass}`} style={{ width: `${percent}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
