"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tables } from "@/lib/types/database";

type RfqRow = Tables<"rfqs"> & {
  project: { project_number: string } | null;
  vendors: { count: number }[];
};

export function RfqsTable({ rfqs }: { rfqs: RfqRow[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rfqs;
    return rfqs.filter((r) => r.title.toLowerCase().includes(q) || r.rfq_number.toLowerCase().includes(q));
  }, [rfqs, query]);

  if (rfqs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No RFQs yet"
        description="Create one from a project's BOM to start collecting vendor quotes."
      />
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search by title or RFQ number…" className="mb-3 max-w-xs" />
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Vendors</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => router.push(`/procurement/${r.id}`)}>
                <TableCell className="font-medium text-foreground">{r.rfq_number}</TableCell>
                <TableCell className="text-sm text-foreground">{r.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.project?.project_number ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {r.vendors[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.due_date ? new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
