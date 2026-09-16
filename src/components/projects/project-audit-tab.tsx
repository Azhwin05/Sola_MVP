import { History } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/types/database";

type LogRow = Tables<"audit_logs"> & { actor: { full_name: string } | null };

export function ProjectAuditTab({ logs }: { logs: LogRow[] }) {
  if (logs.length === 0) {
    return <EmptyState icon={History} title="No audit entries" description="Approvals and record changes for this project will appear here." />;
  }

  return (
    <ul className="max-w-2xl space-y-2">
      {logs.map((log) => (
        <li key={log.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {log.action}
            </Badge>
            <span className="text-sm text-foreground">{log.actor?.full_name ?? "System"}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </li>
      ))}
    </ul>
  );
}
