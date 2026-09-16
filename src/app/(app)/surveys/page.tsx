import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SurveysTable } from "@/components/surveys/surveys-table";

export const metadata = { title: "Site Surveys" };

export default async function SurveysPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "surveys.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "surveys.manage");

  const supabase = await createClient();
  const { data: surveys } = await supabase
    .from("site_surveys")
    .select(
      "*, lead:leads(id, contact_name, company_name), customer:customers(id, name), engineer:profiles!site_surveys_engineer_id_fkey(id, full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Site Surveys"
        description={`${surveys?.length ?? 0} survey${(surveys?.length ?? 0) === 1 ? "" : "s"}`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/surveys/new" />}>
              <Plus className="h-4 w-4" />
              New Survey
            </Button>
          )
        }
      />
      <SurveysTable surveys={surveys ?? []} />
    </div>
  );
}
