"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer, Send, Check, X, Archive as ArchiveIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

export function ProposalActions({
  version,
  isLatest,
  onNewVersion,
}: {
  version: Tables<"proposal_versions">;
  isLatest: boolean;
  onNewVersion: (v: Tables<"proposal_versions">) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function send() {
    setBusy(true);
    const { error } = await createClient().rpc("send_proposal", { p_version_id: version.id });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Proposal marked as sent");
    router.refresh();
  }

  async function accept() {
    setBusy(true);
    const { data, error } = await createClient().rpc("accept_proposal", { p_version_id: version.id });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not accept proposal");
      return;
    }
    toast.success("Proposal accepted — project created");
    router.push(`/projects/${data.id}`);
  }

  async function reject() {
    if (!rejectReason.trim()) return;
    setBusy(true);
    const { error } = await createClient().rpc("reject_proposal", { p_version_id: version.id, p_reason: rejectReason.trim() });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Proposal marked as rejected");
    setRejectOpen(false);
    router.refresh();
  }

  async function archive() {
    setBusy(true);
    const { error } = await createClient().rpc("archive_proposal", { p_version_id: version.id });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Proposal archived");
    router.refresh();
  }

  async function newVersion() {
    const supabase = createClient();
    setBusy(true);
    const { data, error } = await supabase.rpc("create_proposal_version", {
      p_lead_id: version.lead_id,
      p_engineering_revision_id: version.engineering_revision_id,
      p_bom_header_id: version.bom_header_id,
      p_equipment_cost: version.equipment_cost,
      p_installation_cost: version.installation_cost,
      p_other_cost: version.other_cost,
      p_discount: version.discount,
      p_tax_rate_percent: version.tax_rate_percent,
      p_is_interstate: version.is_interstate,
      p_payment_terms: version.payment_terms,
      p_warranty_equipment_years: version.warranty_equipment_years,
      p_warranty_workmanship_years: version.warranty_workmanship_years,
      p_scope: version.scope,
      p_exclusions: version.exclusions,
      p_assumptions: version.assumptions,
      p_change_summary: null,
    });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create new version");
      return;
    }
    toast.success(`Version ${data.version} created`);
    onNewVersion(data);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print / Save as PDF
      </Button>

      {version.status === "draft" && (
        <Button size="sm" onClick={send} disabled={busy}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      )}

      {(version.status === "draft" || version.status === "sent") && (
        <>
          <Button size="sm" onClick={accept} disabled={busy}>
            <Check className="h-4 w-4" />
            Mark Accepted
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)} disabled={busy}>
            <X className="h-4 w-4" />
            Mark Rejected
          </Button>
        </>
      )}

      {isLatest && (
        <Button size="sm" variant="outline" onClick={newVersion} disabled={busy}>
          <Copy className="h-4 w-4" />
          New Version
        </Button>
      )}

      {version.status !== "archived" && version.status !== "accepted" && (
        <Button size="sm" variant="ghost" onClick={archive} disabled={busy}>
          <ArchiveIcon className="h-4 w-4" />
          Archive
        </Button>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject proposal</DialogTitle>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection" rows={3} />
          <DialogFooter>
            <Button variant="destructive" onClick={reject} disabled={busy || !rejectReason.trim()}>
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
