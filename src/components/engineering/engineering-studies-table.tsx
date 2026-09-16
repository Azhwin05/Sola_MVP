"use client";

import { useRouter } from "next/navigation";
import { PlugZap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CapacityOutputs } from "@/lib/engineering/capacity";

type Study = {
  id: string;
  created_at: string;
  lead: { id: string; contact_name: string; company_name: string | null } | null;
  customer: { id: string; name: string } | null;
  revisions: { revision_number: number; outputs: unknown }[];
};

export function EngineeringStudiesTable({ studies }: { studies: Study[] }) {
  const router = useRouter();

  if (studies.length === 0) {
    return (
      <EmptyState
        icon={PlugZap}
        title="No engineering studies yet"
        description="Start a study from a lead once its site survey and EB bills are in."
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer / Lead</TableHead>
            <TableHead>Revisions</TableHead>
            <TableHead className="text-right">Recommended Capacity</TableHead>
            <TableHead>Started</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studies.map((s) => {
            const latest = [...s.revisions].sort((a, b) => b.revision_number - a.revision_number)[0];
            const outputs = latest?.outputs as CapacityOutputs | undefined;
            return (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => router.push(`/engineering/${s.id}`)}>
                <TableCell className="text-sm font-medium text-foreground">
                  {s.customer?.name ?? s.lead?.company_name ?? s.lead?.contact_name ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.revisions.length}</TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {outputs ? `${outputs.actualKwp.toFixed(1)} kWp` : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
