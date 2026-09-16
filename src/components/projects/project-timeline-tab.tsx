import { History } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { Tables } from "@/lib/types/database";

type EventRow = Tables<"project_events"> & { actor: { full_name: string } | null };

export function ProjectTimelineTab({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return <EmptyState icon={History} title="No activity yet" description="Status changes, tasks and milestones will appear here as they happen." />;
  }

  return (
    <ol className="max-w-2xl space-y-4">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3">
          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <div className="min-w-0 flex-1 border-b border-border pb-4">
            <p className="text-sm text-foreground">{e.event}</p>
            {e.comment && <p className="mt-0.5 text-sm text-muted-foreground">{e.comment}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              {e.actor?.full_name ?? "System"} ·{" "}
              {new Date(e.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
