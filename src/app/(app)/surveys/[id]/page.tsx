import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/shared/status-badge";
import { SurveyStatusBar } from "@/components/surveys/survey-status-bar";
import { SurveyForm } from "@/components/surveys/survey-form";
import { SurveyPhotos } from "@/components/surveys/survey-photos";

export default async function SurveyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "surveys.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "surveys.manage");

  const supabase = await createClient();
  const { data: survey } = await supabase
    .from("site_surveys")
    .select(
      "*, lead:leads(id, contact_name, company_name), customer:customers(id, name), site:customer_sites(id, label)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!survey) notFound();

  const [{ data: photos }, { data: categories }] = await Promise.all([
    supabase
      .from("survey_photos")
      .select("*, category:survey_photo_categories(id, name)")
      .eq("survey_id", id)
      .order("uploaded_at", { ascending: false }),
    supabase.from("survey_photo_categories").select("id, name, is_mandatory").order("sort_order"),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{survey.survey_number}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {survey.customer?.name ?? survey.lead?.company_name ?? survey.lead?.contact_name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {survey.site?.label ?? "No site linked"} ·{" "}
            <Link href={`/leads/${survey.lead?.id}`} className="hover:text-foreground hover:underline">
              View lead
            </Link>
          </p>
          <div className="mt-2">
            <StatusBadge status={survey.status} />
          </div>
        </div>
        {canManage && <SurveyStatusBar survey={survey} />}
      </div>

      <div className="space-y-6">
        <SurveyForm survey={survey} canManage={canManage} />
        <SurveyPhotos
          surveyId={survey.id}
          leadId={survey.lead_id}
          organizationId={survey.organization_id}
          photos={photos ?? []}
          categories={categories ?? []}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
