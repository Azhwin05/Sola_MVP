"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/vendors/constants";
import type { Tables } from "@/lib/types/database";

type VendorRow = Tables<"vendors"> & {
  contacts: { count: number }[];
  rfqs: { count: number }[];
};

export function VendorsTable({ vendors }: { vendors: VendorRow[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.gstin ?? "").toLowerCase().includes(q),
    );
  }, [vendors, query]);

  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        title="No vendors yet"
        description="Add the module, inverter and BOS suppliers you send RFQs to."
      />
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search by name or GSTIN…" className="mb-3 max-w-xs" />
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
              <TableHead className="text-right">RFQs</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="cursor-pointer" onClick={() => router.push(`/vendors/${v.id}`)}>
                <TableCell className="font-medium text-foreground">{v.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{VENDOR_CATEGORY_LABELS[v.category as VendorCategory] ?? v.category}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.gstin ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={v.status} />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {v.contacts[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {v.rfqs[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(v.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
