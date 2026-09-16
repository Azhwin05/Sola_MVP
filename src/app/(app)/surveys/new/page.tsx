import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SurveyCreateForm } from "@/components/surveys/survey-create-form";

export const metadata = { title: "New Survey" };

export default async function NewSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_id?: string }>;
}) {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "surveys.manage")) {
    redirect("/surveys");
  }
  const { lead_id } = await searchParams;

  const supabase = await createClient();
  const [{ data: leads }, { data: profiles }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, contact_name, company_name, customer_id, customer:customers(id, name)")
      .not("customer_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  return (
    <div className="max-w-xl">
      <PageHeader title="New Survey" description="Site surveys are scheduled against a lead that's already linked to a customer." />
      <SurveyCreateForm leads={leads ?? []} profiles={profiles ?? []} defaultLeadId={lead_id} />
    </div>
  );
}
