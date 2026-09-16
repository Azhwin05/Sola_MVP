import { History } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { CapacityOutputs } from "@/lib/engineering/capacity";
import type { Tables } from "@/lib/types/database";

export function EngineeringRevisionHistory({ revisions }: { revisions: Tables<"engineering_revisions">[] }) {
  if (revisions.length === 0) {
    return <EmptyState icon={History} title="No revisions yet" description="Each time you calculate capacity, a new numbered revision is kept here." />;
  }

  return (
    <ol className="max-w-2xl space-y-3">
      {revisions.map((rev) => {
        const outputs = rev.outputs as CapacityOutputs;
        return (
          <li key={rev.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Revision {rev.revision_number}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(rev.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {outputs.actualKwp.toFixed(1)} kWp · {outputs.panelQty} panels · ₹{Math.round(outputs.estimatedAnnualSavings).toLocaleString("en-IN")}/yr est. savings
            </p>
          </li>
        );
      })}
    </ol>
  );
}
