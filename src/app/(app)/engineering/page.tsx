import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EngineeringStudiesTable } from "@/components/engineering/engineering-studies-table";
import { NewStudyButton } from "@/components/engineering/new-study-button";

export const metadata = { title: "Engineering" };

export default async function EngineeringPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "engineering.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "engineering.manage");

  const supabase = await createClient();
  const [{ data: studies }, { data: leads }] = await Promise.all([
    supabase
      .from("engineering_studies")
      .select("*, lead:leads(id, contact_name, company_name), customer:customers(id, name), revisions:engineering_revisions(revision_number, outputs)")
      .order("created_at", { ascending: false }),
    canManage
      ? supabase
          .from("leads")
          .select("id, contact_name, company_name")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div>
      <PageHeader
        title="Engineering"
        description="Capacity calculations and BOM, one study per lead."
        actions={canManage && <NewStudyButton leads={leads ?? []} />}
      />
      <EngineeringStudiesTable studies={studies ?? []} />
    </div>
  );
}
