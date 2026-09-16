import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { Tables } from "@/lib/types/database";

export function EngineeringConsumptionTab({ bills }: { bills: Tables<"eb_bills">[] }) {
  if (bills.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No consumption history yet"
        description="Record EB bills for this customer to see their 12-month consumption profile here."
      />
    );
  }

  const chronological = [...bills].reverse();
  const max = Math.max(...chronological.map((b) => b.units_consumed));
  const avg = chronological.reduce((s, b) => s + b.units_consumed, 0) / chronological.length;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">Average monthly consumption</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{Math.round(avg).toLocaleString("en-IN")} kWh</p>
      </div>
      <div className="space-y-2">
        {chronological.map((b) => (
          <div key={b.id} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">
              {new Date(b.billing_month).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
            </span>
            <div className="h-4 flex-1 rounded bg-muted">
              <div
                className="h-4 rounded bg-info"
                style={{ width: `${max > 0 ? (b.units_consumed / max) * 100 : 0}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {b.units_consumed.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
