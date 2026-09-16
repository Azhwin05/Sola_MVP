import { notFound, redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InlineComingSoon } from "@/components/shared/inline-coming-soon";
import { LeadHeader } from "@/components/leads/lead-header";
import { LeadOverview } from "@/components/leads/lead-overview";
import { LeadActivityTab } from "@/components/leads/lead-activity-tab";
import { LeadSiteTab } from "@/components/leads/lead-site-tab";
import { LeadNotesTab } from "@/components/leads/lead-notes-tab";
import { LeadSurveyTab } from "@/components/leads/lead-survey-tab";
import { LeadEngineeringTab } from "@/components/leads/lead-engineering-tab";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "leads.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "leads.manage");

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*, owner:profiles!leads_owner_id_fkey(id, full_name), source:lead_sources(id, name), customer:customers(id, name), site:customer_sites(id, label)")
    .eq("id", id)
    .maybeSingle();
  if (!lead) notFound();

  const [{ data: activities }, { data: sources }, { data: profiles }, { data: customers }, { data: sites }] = await Promise.all([
    supabase.from("lead_activities").select("*, actor:profiles(full_name)").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("lead_sources").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name").order("full_name"),
    supabase.from("customers").select("id, name").order("name"),
    lead.customer_id
      ? supabase.from("customer_sites").select("id, label").eq("customer_id", lead.customer_id).order("created_at")
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div>
      <LeadHeader lead={lead} canManage={canManage} customers={customers ?? []} />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity {activities && activities.length > 0 ? `(${activities.length})` : ""}</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="survey">Survey</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="proposal">Proposal</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <LeadOverview lead={lead} canManage={canManage} sources={sources ?? []} profiles={profiles ?? []} />
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          <LeadActivityTab leadId={lead.id} activities={activities ?? []} canManage={canManage} />
        </TabsContent>

        <TabsContent value="site" className="pt-6">
          <LeadSiteTab lead={lead} sites={sites ?? []} canManage={canManage} />
        </TabsContent>

        <TabsContent value="survey" className="pt-6">
          <LeadSurveyTab leadId={lead.id} hasCustomer={!!lead.customer_id} canManage={canManage} />
        </TabsContent>

        <TabsContent value="engineering" className="pt-6">
          <LeadEngineeringTab leadId={lead.id} canManage={canManage} />
        </TabsContent>

        <TabsContent value="notes" className="pt-6">
          <LeadNotesTab leadId={lead.id} notes={lead.notes} canManage={canManage} />
        </TabsContent>

        <TabsContent value="communication" className="pt-6">
          <InlineComingSoon label="Communication timeline" phase="Phase 8" />
        </TabsContent>
        <TabsContent value="proposal" className="pt-6">
          <InlineComingSoon label="Proposals" phase="Phase 4" />
        </TabsContent>
        <TabsContent value="documents" className="pt-6">
          <InlineComingSoon label="Documents" phase="Phase 8" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
