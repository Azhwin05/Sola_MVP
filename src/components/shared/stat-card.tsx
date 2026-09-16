import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "destructive";
}) {
  const toneClass = {
    neutral: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];

  const content = (
    <div className="flex items-start justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
      </div>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
