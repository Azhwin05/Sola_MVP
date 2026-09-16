import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/components/projects/projects-table";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "projects.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "projects.manage");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select(
      "*, customer:customers(id, name), pm:profiles!projects_pm_id_fkey(id, full_name), tasks:project_tasks(status, due_date), risks:project_risks(impact, status)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects?.length ?? 0} project${(projects?.length ?? 0) === 1 ? "" : "s"}`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/projects/new" />}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )
        }
      />
      <ProjectsTable projects={projects ?? []} />
    </div>
  );
}
