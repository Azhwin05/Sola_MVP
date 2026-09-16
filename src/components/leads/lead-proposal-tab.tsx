import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function LeadProposalTab({ leadId, hasStudy }: { leadId: string; hasStudy: boolean }) {
  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("proposal_versions")
    .select("proposal_number, version, status, total_amount, updated_at")
    .eq("lead_id", leadId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return (
      <EmptyState
        icon={FileText}
        title={hasStudy ? "No proposal yet" : "Calculate capacity first"}
        description={
          hasStudy
            ? "Build a proposal from this lead's engineering revision and BOM."
            : "A proposal is built from an engineering revision and its BOM — start one in the Engineering tab first."
        }
        action={
          hasStudy && (
            <Button size="sm" render={<Link href={`/proposals/${leadId}`} />}>
              Create Proposal
            </Button>
          )
        }
      />
    );
  }

  return (
    <Link
      href={`/proposals/${leadId}`}
      className="flex max-w-md items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent"
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          {latest.proposal_number} v{latest.version}
        </p>
        <p className="text-xs text-muted-foreground">₹{latest.total_amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
      </div>
      <StatusBadge status={latest.status} />
    </Link>
  );
}
