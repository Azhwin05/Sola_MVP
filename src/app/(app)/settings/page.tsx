import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrganizationProfileForm } from "@/components/settings/organization-profile-form";
import { NumberingFormatsForm } from "@/components/settings/numbering-formats-form";
import { RolesOverview } from "@/components/settings/roles-overview";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "settings.manage")) {
    redirect("/control-tower");
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("system_settings")
    .select("*")
    .eq("organization_id", ctx!.organization.id)
    .single();

  const { data: roles } = await supabase
    .from("roles")
    .select("id, key, name, description, role_permissions(count)")
    .order("name");

  return (
    <div>
      <PageHeader title="Settings" description="Organization profile, numbering formats and roles." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="max-w-xl pt-6">
          <OrganizationProfileForm organization={ctx!.organization} />
        </TabsContent>

        <TabsContent value="numbering" className="max-w-xl pt-6">
          <NumberingFormatsForm
            formats={(settings?.numbering_formats as Record<string, string>) ?? {}}
            organizationId={ctx!.organization.id}
          />
        </TabsContent>

        <TabsContent value="roles" className="pt-6">
          <RolesOverview roles={roles ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
