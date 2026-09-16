import Link from "next/link";
import { PlugZap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import { EngineeringStudySummary } from "@/components/leads/engineering-study-summary";

export async function ProjectEngineeringTab({ leadId }: { leadId: string | null }) {
  if (!leadId) {
    return <EmptyState icon={PlugZap} title="No linked lead" description="This project has no linked lead, so there's no engineering study to show." />;
  }

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
        title="No engineering study"
        description="The originating lead doesn't have an engineering study."
        action={
          <Link href={`/leads/${leadId}`} className="text-sm text-foreground underline">
            View lead
          </Link>
        }
      />
    );
  }

  return <EngineeringStudySummary studyId={study.id} revisions={study.revisions} />;
}
