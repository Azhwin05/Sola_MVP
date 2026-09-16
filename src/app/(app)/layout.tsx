import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const ctx = await getSessionContext();

  if (!ctx) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      orgName={ctx.organization.name}
      fullName={ctx.profile.full_name}
      email={ctx.profile.email}
      permissions={ctx.permissions}
    >
      {children}
    </AppShell>
  );
}
