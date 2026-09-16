import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { AuthShell } from "@/components/auth/auth-shell";
import { JoinForm } from "@/components/auth/join-form";

export const metadata = { title: "Join organization" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: preview } = await supabase
    .rpc("get_invite_preview", { p_token: token })
    .maybeSingle();

  if (!preview || !preview.valid) {
    return (
      <AuthShell title="Invite not valid" description="This invite link has expired or already been used.">
        <p className="text-sm text-muted-foreground">
          Ask your organization owner to send you a new invite link.
        </p>
      </AuthShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = user ? await getSessionContext() : null;

  if (ctx) {
    return (
      <AuthShell title="Already set up" description="This account already belongs to an organization.">
        <p className="text-sm text-muted-foreground">
          Sign out and use a different account to accept this invite.
        </p>
      </AuthShell>
    );
  }

  return (
    <JoinForm
      token={token}
      organizationName={preview.organization_name}
      roleName={preview.role_name}
      isAuthenticated={!!user}
      email={user?.email ?? ""}
    />
  );
}
