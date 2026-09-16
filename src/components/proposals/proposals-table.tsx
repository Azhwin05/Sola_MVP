"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tables } from "@/lib/types/database";

type ProposalRow = Tables<"proposal_versions"> & {
  lead: { id: string; contact_name: string; company_name: string | null } | null;
  customer: { id: string; name: string } | null;
};

export function ProposalsTable({ proposals }: { proposals: ProposalRow[] }) {
  const router = useRouter();

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No proposals yet"
        description="Proposals are created from a lead's Proposal tab, once a capacity calculation and BOM exist."
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal</TableHead>
            <TableHead>Customer / Lead</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((p) => (
            <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/proposals/${p.lead_id}`)}>
              <TableCell className="font-medium text-foreground">
                {p.proposal_number} <span className="text-muted-foreground">v{p.version}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {p.customer?.name ?? p.lead?.company_name ?? p.lead?.contact_name ?? "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                ₹{p.total_amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
