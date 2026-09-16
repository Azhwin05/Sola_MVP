import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";

type HealthKey = "healthy" | "at_risk" | "delayed" | "blocked";

const ROWS: { key: HealthKey; label: string; bar: string; dot: string }[] = [
  { key: "healthy", label: "On Track", bar: "bg-success", dot: "bg-success" },
  { key: "at_risk", label: "At Risk", bar: "bg-warning", dot: "bg-warning" },
  { key: "delayed", label: "Delayed", bar: "bg-brand-cyan", dot: "bg-brand-cyan" },
  { key: "blocked", label: "Blocked", bar: "bg-destructive", dot: "bg-destructive" },
];

export function ProjectHealthSummary({ counts }: { counts: Record<HealthKey, number> }) {
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
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] leading-none font-semibold tracking-tight tabular-nums text-foreground">
          {total}
        </span>
        <span className="text-xs text-muted-foreground">active project{total === 1 ? "" : "s"}</span>
      </div>

      {/* One stacked bar reads the mix at a glance; the rows below give the
          exact split without making the reader measure segments. */}
      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
        {ROWS.map((row) =>
          counts[row.key] > 0 ? (
            <div
              key={row.key}
              className={row.bar}
              style={{ width: `${(counts[row.key] / total) * 100}%` }}
              aria-hidden
            />
          ) : null,
        )}
      </div>

      <ul className="mt-4 space-y-2.5">
        {ROWS.map((row) => (
          <li key={row.key} className="flex items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${row.dot}`} />
            <span className="flex-1 text-[13px] text-muted-foreground">{row.label}</span>
            <span className="text-[13px] font-medium tabular-nums text-foreground">{counts[row.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
