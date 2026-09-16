"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CUSTOMER_TYPE_LABELS, type CustomerType } from "@/lib/customers/constants";
import type { Tables } from "@/lib/types/database";

type CustomerRow = Tables<"customers"> & {
  contacts: { count: number }[];
  sites: { count: number }[];
  leads: { count: number }[];
};

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.gstin ?? "").toLowerCase().includes(q),
    );
  }, [customers, query]);

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No customers yet"
        description="Customers are created directly, or automatically when you convert a won lead."
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
              <TableHead>Type</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Contacts</TableHead>
              <TableHead className="text-right">Sites</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{CUSTOMER_TYPE_LABELS[c.customer_type as CustomerType] ?? c.customer_type}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.gstin ?? "—"}</TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {c.contacts[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {c.sites[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {c.leads[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
