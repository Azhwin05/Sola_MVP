import { PlugZap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import { StartStudyButton } from "@/components/leads/start-study-button";
import { EngineeringStudySummary } from "@/components/leads/engineering-study-summary";

export async function LeadEngineeringTab({ leadId, canManage }: { leadId: string; canManage: boolean }) {
  const supabase = await createClient();
  const { data: study } = await supabase
    .from("engineering_studies")
    .select("id, revisions:engineering_revisions(revision_number, outputs)")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (!study) {
    return (
      <EmptyState
        icon={PlugZap}
        title="No engineering study yet"
        description="Calculate a recommended system size and BOM once consumption data and a survey are available."
        action={canManage && <StartStudyButton leadId={leadId} />}
      />
    );
  }

  return <EngineeringStudySummary studyId={study.id} revisions={study.revisions} />;
}
