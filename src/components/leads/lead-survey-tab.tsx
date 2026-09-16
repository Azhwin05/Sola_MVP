import Link from "next/link";
import { Ruler } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function LeadSurveyTab({
  leadId,
  hasCustomer,
  canManage,
}: {
  leadId: string;
  hasCustomer: boolean;
  canManage: boolean;
}) {
  const supabase = await createClient();
  const { data: surveys } = await supabase
    .from("site_surveys")
    .select("id, survey_number, status, survey_date, site:customer_sites(label)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (!surveys || surveys.length === 0) {
    if (!hasCustomer) {
      return (
        <EmptyState
          icon={Ruler}
          title="Link a customer first"
          description="Site surveys are scheduled against a customer's site. Convert this lead to a customer, then schedule a survey."
        />
      );
    }
    return (
      <EmptyState
        icon={Ruler}
        title="No survey scheduled"
        description="Schedule a site survey to capture roof measurements, electrical details and photos."
        action={
          canManage && (
            <Button size="sm" render={<Link href={`/surveys/new?lead_id=${leadId}`} />}>
              Schedule Survey
            </Button>
          )
        }
      />
    );
  }

  return (
    <ul className="max-w-md space-y-2">
      {surveys.map((s) => (
        <li key={s.id}>
          <Link
            href={`/surveys/${s.id}`}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{s.survey_number}</p>
              <p className="text-xs text-muted-foreground">
                {s.site?.label ?? "No site"} ·{" "}
                {new Date(s.survey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <StatusBadge status={s.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
