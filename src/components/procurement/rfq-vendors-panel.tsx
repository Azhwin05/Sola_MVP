"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { QuoteDialog } from "@/components/procurement/quote-dialog";
import type { RfqItemRow, RfqVendorRow, QuoteRow } from "@/components/procurement/types";
import type { Tables } from "@/lib/types/database";

export function RfqVendorsPanel({
  rfq,
  items,
  rfqVendors,
  quotes,
  canManage,
}: {
  rfq: Tables<"rfqs">;
  items: RfqItemRow[];
  rfqVendors: RfqVendorRow[];
  quotes: QuoteRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [dialogVendor, setDialogVendor] = useState<{ id: string; name: string } | null>(null);
  const [awarding, setAwarding] = useState<string | null>(null);

  const canQuote = rfq.status === "sent" || rfq.status === "quotes_received";
  const canAward = canQuote;

  async function award(quoteId: string) {
    setAwarding(quoteId);
    const { error } = await createClient().rpc("award_rfq", { p_rfq_id: rfq.id, p_quote_id: quoteId });
    setAwarding(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("RFQ awarded");
    router.refresh();
  }

  if (rfqVendors.length === 0) {
    return <EmptyState icon={Users} title="No vendors invited" description="Vendors invited to quote on this RFQ will show up here." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total quoted</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead className="text-right">Delivery</TableHead>
              <TableHead>Payment terms</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqVendors.map((rv) => {
              if (!rv.vendor) return null;
              const quote = quotes.find((q) => q.vendor?.id === rv.vendor_id);
              const total = quote ? quote.items.reduce((sum, i) => sum + Number(i.quoted_amount ?? 0), 0) : null;
              const isAwarded = rfq.awarded_quote_id === quote?.id;

              return (
                <TableRow key={rv.id}>
                  <TableCell className="font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      {isAwarded && <Trophy className="h-3.5 w-3.5 text-success" />}
                      {rv.vendor.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={quote?.status ?? rv.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-foreground">
                    {total != null ? `₹${total.toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {quote?.valid_until
                      ? new Date(quote.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {quote?.delivery_lead_days != null ? `${quote.delivery_lead_days}d` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{quote?.payment_terms || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && canQuote && (
                        <Button size="xs" variant="outline" onClick={() => setDialogVendor({ id: rv.vendor!.id, name: rv.vendor!.name })}>
                          {quote ? "Edit quote" : "Record quote"}
                        </Button>
                      )}
                      {canManage && canAward && quote && !isAwarded && (
                        <Button size="xs" onClick={() => award(quote.id)} disabled={awarding === quote.id}>
                          {awarding === quote.id ? "Awarding…" : "Award"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {dialogVendor && (
        <QuoteDialog
          open={!!dialogVendor}
          onOpenChange={(open) => !open && setDialogVendor(null)}
          rfqId={rfq.id}
          vendor={dialogVendor}
          items={items}
          existingQuote={quotes.find((q) => q.vendor?.id === dialogVendor.id)}
        />
      )}
    </div>
  );
}
