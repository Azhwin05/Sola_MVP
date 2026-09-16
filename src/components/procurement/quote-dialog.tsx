"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { RfqItemRow, QuoteRow } from "@/components/procurement/types";

export function QuoteDialog({
  open,
  onOpenChange,
  rfqId,
  vendor,
  items,
  existingQuote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfqId: string;
  vendor: { id: string; name: string };
  items: RfqItemRow[];
  existingQuote?: QuoteRow;
}) {
  const router = useRouter();
  // The parent only ever mounts this dialog fresh (conditional render, not a
  // prop update on a persistent instance), so deriving initial state here is
  // safe and avoids the "reset state in an effect" anti-pattern.
  const [rates, setRates] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const item of items) {
      const existing = existingQuote?.items.find((i) => i.rfq_item_id === item.id);
      initial[item.id] = existing ? String(existing.quoted_rate) : "";
    }
    return initial;
  });
  const [validUntil, setValidUntil] = useState(existingQuote?.valid_until ?? "");
  const [paymentTerms, setPaymentTerms] = useState(existingQuote?.payment_terms ?? "");
  const [deliveryDays, setDeliveryDays] = useState(
    existingQuote?.delivery_lead_days != null ? String(existingQuote.delivery_lead_days) : "",
  );
  const [notes, setNotes] = useState(existingQuote?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const total = items.reduce((sum, item) => sum + Number(item.quantity) * (Number(rates[item.id]) || 0), 0);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_vendor_quote", {
      p_rfq_id: rfqId,
      p_vendor_id: vendor.id,
      p_valid_until: validUntil || null,
      p_payment_terms: paymentTerms || null,
      p_delivery_lead_days: deliveryDays ? Number(deliveryDays) : null,
      p_notes: notes || null,
      p_items: items.map((item) => ({ rfq_item_id: item.id, quoted_rate: Number(rates[item.id]) || 0 })),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Quote recorded for ${vendor.name}`);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingQuote ? "Edit" : "Record"} quote — {vendor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Rate (₹)</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{item.item}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {Number(item.quantity).toLocaleString("en-IN")} {item.unit}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={rates[item.id] ?? ""}
                        onChange={(e) => setRates((r) => ({ ...r, [item.id]: e.target.value }))}
                        className="h-8 w-28 text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">
                      ₹{(Number(item.quantity) * (Number(rates[item.id]) || 0)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium text-foreground">
                    Total
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-foreground">
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valid-until">Valid until</Label>
              <Input id="valid-until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery-days">Delivery lead (days)</Label>
              <Input id="delivery-days" type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment-terms">Payment terms</Label>
            <Input id="payment-terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="50% advance, balance on delivery" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote-notes">Notes</Label>
            <Textarea id="quote-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
