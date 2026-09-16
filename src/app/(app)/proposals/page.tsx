import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProposalsTable } from "@/components/proposals/proposals-table";

export const metadata = { title: "Proposals" };

export default async function ProposalsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "proposals.view")) {
    redirect("/control-tower");
  }

  const supabase = await createClient();
  const { data: versions } = await supabase
    .from("proposal_versions")
    .select("*, lead:leads(id, contact_name, company_name), customer:customers(id, name)")
    .order("lead_id")
    .order("version", { ascending: false });

  const latestByLead = new Map<string, NonNullable<typeof versions>[number]>();
  for (const v of versions ?? []) {
    if (!latestByLead.has(v.lead_id)) latestByLead.set(v.lead_id, v);
  }
  const proposals = Array.from(latestByLead.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <PageHeader title="Proposals" description={`${proposals.length} proposal${proposals.length === 1 ? "" : "s"}`} />
      <ProposalsTable proposals={proposals} />
    </div>
  );
}
