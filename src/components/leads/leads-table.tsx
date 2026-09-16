"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { LEAD_PRIORITY_LABELS, type LeadPriority } from "@/lib/leads/constants";
import type { LeadRow } from "@/components/leads/types";

function isOverdue(lead: LeadRow) {
  if (!lead.next_action_date) return false;
  if (["won", "lost"].includes(lead.stage)) return false;
  return new Date(lead.next_action_date) < new Date(new Date().toDateString());
}

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Est. Value</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Next Action</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
              <TableCell>
                <p className="text-sm font-medium text-foreground">{lead.contact_name}</p>
                <p className="text-xs text-muted-foreground">{lead.company_name || lead.lead_number}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.stage} />
              </TableCell>
              <TableCell>
                <Badge variant={lead.priority === "high" ? "destructive" : "secondary"}>
                  {LEAD_PRIORITY_LABELS[lead.priority as LeadPriority] ?? lead.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {lead.estimated_value ? `₹${lead.estimated_value.toLocaleString("en-IN")}` : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.owner?.full_name ?? "Unassigned"}</TableCell>
              <TableCell className="text-sm">
                {lead.next_action ? (
                  <span className={isOverdue(lead) ? "font-medium text-destructive" : "text-muted-foreground"}>
                    {lead.next_action}
                    {lead.next_action_date &&
                      ` · ${new Date(lead.next_action_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.source?.name ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
