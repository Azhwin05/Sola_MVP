import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "projects.manage")) {
    redirect("/projects");
  }

  const supabase = await createClient();
  const [{ data: customers }, { data: profiles }] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  return (
    <div className="max-w-xl">
      <PageHeader
        title="New Project"
        description="Most projects are created automatically when a proposal is accepted — use this for projects started outside that flow."
      />
      <ProjectForm customers={customers ?? []} profiles={profiles ?? []} />
    </div>
  );
}
