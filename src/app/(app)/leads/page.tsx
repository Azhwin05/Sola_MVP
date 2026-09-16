import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LeadsView } from "@/components/leads/leads-view";

export const metadata = { title: "Leads & CRM" };

export default async function LeadsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "leads.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "leads.manage");

  const supabase = await createClient();
  const [{ data: leads }, { data: profiles }] = await Promise.all([
    supabase
      .from("leads")
      .select("*, owner:profiles!leads_owner_id_fkey(id, full_name), source:lead_sources(name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  return (
    <div>
      <PageHeader
        title="Leads & CRM"
        description={`${leads?.length ?? 0} lead${(leads?.length ?? 0) === 1 ? "" : "s"} in the pipeline`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/leads/new" />}>
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          )
        }
      />
      <LeadsView leads={leads ?? []} profiles={profiles ?? []} canManage={canManage} />
    </div>
  );
}
