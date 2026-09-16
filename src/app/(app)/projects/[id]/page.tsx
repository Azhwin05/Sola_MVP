import { notFound, redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InlineComingSoon } from "@/components/shared/inline-coming-soon";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverviewTab } from "@/components/projects/project-overview-tab";
import { ProjectTimelineTab } from "@/components/projects/project-timeline-tab";
import { ProjectTasksTab } from "@/components/projects/project-tasks-tab";
import { ProjectSiteTab } from "@/components/projects/project-site-tab";
import { ProjectEngineeringTab } from "@/components/projects/project-engineering-tab";
import { ProjectProcurementTab } from "@/components/projects/project-procurement-tab";
import { ProjectAuditTab } from "@/components/projects/project-audit-tab";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "projects.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "projects.manage");

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select(
      "*, customer:customers(id, name, billing_address), site:customer_sites(id, label, address), pm:profiles!projects_pm_id_fkey(id, full_name), lead:leads(id, contact_name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [{ data: milestones }, { data: tasks }, { data: risks }, { data: events }, { data: profiles }, { data: auditLogs }] =
    await Promise.all([
      supabase.from("project_milestones").select("*, owner:profiles(id, full_name)").eq("project_id", id).order("sort_order"),
      supabase.from("project_tasks").select("*, owner:profiles!project_tasks_owner_id_fkey(id, full_name)").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_risks").select("*, owner:profiles!project_risks_owner_id_fkey(id, full_name)").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_events").select("*, actor:profiles(full_name)").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase.from("audit_logs").select("*, actor:profiles(full_name)").eq("entity_type", "project").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);

  return (
    <div>
      <ProjectHeader
        project={project}
        milestones={milestones ?? []}
        tasks={tasks ?? []}
        risks={risks ?? []}
        profiles={profiles ?? []}
        canManage={canManage}
      />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks {tasks && tasks.length > 0 ? `(${tasks.length})` : ""}</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="qa">QA/QC</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="om">O&amp;M</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <ProjectOverviewTab
            project={project}
            milestones={milestones ?? []}
            risks={risks ?? []}
            profiles={profiles ?? []}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="timeline" className="pt-6">
          <ProjectTimelineTab events={events ?? []} />
        </TabsContent>

        <TabsContent value="tasks" className="pt-6">
          <ProjectTasksTab projectId={project.id} tasks={tasks ?? []} profiles={profiles ?? []} canManage={canManage} />
        </TabsContent>

        <TabsContent value="site" className="pt-6">
          <ProjectSiteTab project={project} />
        </TabsContent>

        <TabsContent value="engineering" className="pt-6">
          <ProjectEngineeringTab leadId={project.lead_id} />
        </TabsContent>

        <TabsContent value="procurement" className="pt-6">
          <ProjectProcurementTab projectId={project.id} canManage={canManage} />
        </TabsContent>
        <TabsContent value="inventory" className="pt-6">
          <InlineComingSoon label="Inventory" phase="Phase 5" />
        </TabsContent>
        <TabsContent value="installation" className="pt-6">
          <InlineComingSoon label="Installation execution" phase="Phase 6" />
        </TabsContent>
        <TabsContent value="qa" className="pt-6">
          <InlineComingSoon label="QA/QC" phase="Phase 6" />
        </TabsContent>
        <TabsContent value="finance" className="pt-6">
          <InlineComingSoon label="Finance" phase="Phase 7" />
        </TabsContent>
        <TabsContent value="documents" className="pt-6">
          <InlineComingSoon label="Documents" phase="Phase 8" />
        </TabsContent>
        <TabsContent value="communications" className="pt-6">
          <InlineComingSoon label="Communications" phase="Phase 8" />
        </TabsContent>
        <TabsContent value="monitoring" className="pt-6">
          <InlineComingSoon label="Monitoring" phase="Phase 9" />
        </TabsContent>
        <TabsContent value="om" className="pt-6">
          <InlineComingSoon label="O&M / AMC" phase="Phase 9" />
        </TabsContent>

        <TabsContent value="audit" className="pt-6">
          <ProjectAuditTab logs={auditLogs ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
