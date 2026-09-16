"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { EbBillFormDialog } from "@/components/engineering/eb-bill-form-dialog";
import type { Tables } from "@/lib/types/database";

type Bill = Tables<"eb_bills"> & { customer: { id: string; name: string } | null };

export function EbBillsManager({
  bills,
  customers,
  canManage,
}: {
  bills: Bill[];
  customers: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (customerId === "all") return bills;
    return bills.filter((b) => b.customer_id === customerId);
  }, [bills, customerId]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canManage && (
          <Button size="sm" className="ml-auto" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Bill
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No bills recorded"
          description="Add monthly EB bills to build the 12-month consumption profile used for capacity calculations."
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-sm text-foreground">{b.customer?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(b.billing_month).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {b.units_consumed.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {b.amount ? `₹${b.amount.toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.paid_status === "paid" ? "secondary" : "outline"} className="capitalize">
                      {b.paid_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EbBillFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={customers}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
