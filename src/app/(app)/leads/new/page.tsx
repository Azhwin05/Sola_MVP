import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { LeadForm } from "@/components/leads/lead-form";

export const metadata = { title: "New Lead" };

export default async function NewLeadPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "leads.manage")) {
    redirect("/leads");
  }

  const supabase = await createClient();
  const [{ data: sources }, { data: profiles }, { data: customers }] = await Promise.all([
    supabase.from("lead_sources").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name").order("full_name"),
    supabase.from("customers").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Lead" description="Capture a new opportunity and assign it to the pipeline." />
      <LeadForm
        sources={sources ?? []}
        profiles={profiles ?? []}
        customers={customers ?? []}
        defaultOwnerId={ctx!.profile.id}
      />
    </div>
  );
}
