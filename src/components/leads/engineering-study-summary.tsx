import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CapacityOutputs } from "@/lib/engineering/capacity";

export function EngineeringStudySummary({
  studyId,
  revisions,
}: {
  studyId: string;
  revisions: { revision_number: number; outputs: unknown }[];
}) {
  const latest = [...revisions].sort((a, b) => b.revision_number - a.revision_number)[0];
  const outputs = latest?.outputs as CapacityOutputs | undefined;

  return (
    <div className="max-w-md rounded-lg border border-border p-4">
      {outputs ? (
        <>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{outputs.actualKwp.toFixed(1)} kWp</p>
          <p className="text-sm text-muted-foreground">
            {outputs.panelQty} panels · Revision {latest.revision_number}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Study started — no calculation yet.</p>
      )}
      <Button className="mt-3" size="sm" variant="outline" render={<Link href={`/engineering/${studyId}`} />}>
        Open Study
      </Button>
    </div>
  );
}
