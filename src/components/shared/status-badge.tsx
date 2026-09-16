import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "destructive" | "info" | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-info/10 text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

/** Maps common workflow status strings to a semantic tone per the design system's color rules. */
export function toneForStatus(status: string): StatusTone {
  const s = status.toLowerCase();
  if (["healthy", "on_track", "on track", "approved", "paid", "completed", "won", "resolved", "closed", "verified", "active"].includes(s)) {
    return "success";
  }
  if (["at_risk", "at risk", "pending", "warning", "partially_paid", "in_progress", "in progress", "waiting", "assigned"].includes(s)) {
    return "warning";
  }
  if (["blocked", "delayed", "overdue", "failed", "rejected", "cancelled", "critical", "lost"].includes(s)) {
    return "destructive";
  }
  if (["negotiation", "qualified", "sent", "survey", "engineering", "installation", "commissioning"].includes(s)) {
    return "info";
  }
  return "neutral";
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: StatusTone;
  className?: string;
}) {
  const resolvedTone = tone ?? toneForStatus(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        TONE_CLASSES[resolvedTone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace(/_/g, " ")}
    </span>
  );
}
