import { notFound, redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProposalWorkspace } from "@/components/proposals/proposal-workspace";

export default async function ProposalPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "proposals.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "proposals.manage");

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*, customer:customers(id, name, gstin, billing_address)")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) notFound();

  const [{ data: versions }, { data: study }, { data: organization }] = await Promise.all([
    supabase
      .from("proposal_versions")
      .select("*")
      .eq("lead_id", leadId)
      .order("version", { ascending: false }),
    supabase
      .from("engineering_studies")
      .select("id, revisions:engineering_revisions(*, boms:bom_headers(*, items:bom_items(*)))")
      .eq("lead_id", leadId)
      .maybeSingle(),
    supabase.from("organizations").select("*").eq("id", ctx!.organization.id).single(),
  ]);

  return (
    <ProposalWorkspace
      lead={lead}
      versions={versions ?? []}
      revisions={study?.revisions ?? []}
      organization={organization!}
      canManage={canManage}
    />
  );
}
