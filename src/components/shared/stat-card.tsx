import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: LucideIcon;
  hint?: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "destructive";
}) {
  const valueClass = {
    neutral: "text-foreground",
    brand: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];

  const iconClass = {
    neutral: "bg-muted text-muted-foreground",
    brand: "bg-primary-light text-primary",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    destructive: "bg-destructive-bg text-destructive",
  }[tone];

  const content = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xs transition-all",
        href && "hover:-translate-y-px hover:border-border-strong hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", iconClass)}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      <p className={cn("mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums", valueClass)}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[11px] text-subtle">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
        {content}
      </Link>
    );
  }
  return content;
}
