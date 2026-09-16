"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

export function RfqActions({ rfq }: { rfq: Tables<"rfqs"> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  async function send() {
    setBusy(true);
    const { error } = await createClient().rpc("send_rfq", { p_rfq_id: rfq.id });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("RFQ sent to vendors");
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    const { error } = await createClient().rpc("cancel_rfq", { p_rfq_id: rfq.id, p_reason: cancelReason.trim() || null });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("RFQ cancelled");
    setCancelOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {rfq.status === "draft" && (
        <Button size="sm" onClick={send} disabled={busy}>
          <Send className="h-4 w-4" />
          Send to vendors
        </Button>
      )}
      {(rfq.status === "sent" || rfq.status === "quotes_received") && (
        <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)} disabled={busy}>
          <Ban className="h-4 w-4" />
          Cancel RFQ
        </Button>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel RFQ</DialogTitle>
          </DialogHeader>
          <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" rows={3} />
          <DialogFooter>
            <Button variant="destructive" onClick={cancel} disabled={busy}>
              Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
