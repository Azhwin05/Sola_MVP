import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { RfqForm } from "@/components/procurement/rfq-form";

export const metadata = { title: "New RFQ" };

export default async function NewRfqPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "procurement.manage")) {
    redirect("/procurement");
  }

  const supabase = await createClient();
  const [{ data: projects }, { data: vendors }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, project_number, customer:customers(name), proposal:proposal_versions(bom_header_id)")
      .not("proposal_version_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("vendors")
      .select("id, name, category, status")
      .eq("status", "active")
      .order("name"),
  ]);

  const sources = (projects ?? [])
    .filter((p) => p.proposal?.bom_header_id)
    .map((p) => ({
      id: p.id,
      label: `${p.project_number} — ${p.customer?.name ?? "Unknown customer"}`,
      bomHeaderId: p.proposal!.bom_header_id as string,
    }));

  return (
    <div className="max-w-2xl">
      <PageHeader title="New RFQ" description="Pull the equipment list from a project's BOM and invite vendors to quote." />
      <RfqForm sources={sources} vendors={vendors ?? []} />
    </div>
  );
}
