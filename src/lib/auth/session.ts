import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type SessionContext = {
  user: { id: string; email: string };
  profile: Tables<"profiles">;
  organization: Tables<"organizations">;
  roles: Tables<"roles">[];
  permissions: Set<string>;
};

/**
 * Loads the authenticated user's profile, organization, roles and flattened
 * permission set. Returns null when there is no session or no profile yet
 * (e.g. mid-onboarding, before bootstrap_organization has run).
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single();

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(*)")
    .eq("user_id", user.id);

  const roles = (userRoles ?? [])
    .map((ur) => ur.roles)
    .filter((r): r is Tables<"roles"> => r !== null);

  const roleIds = roles.map((r) => r.id);

  const permissions = new Set<string>();
  if (roleIds.length > 0) {
    const { data: rolePermissions } = await supabase
      .from("role_permissions")
      .select("permissions(key)")
      .in("role_id", roleIds);

    for (const rp of rolePermissions ?? []) {
      if (rp.permissions?.key) permissions.add(rp.permissions.key);
    }
  }

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile,
    organization: organization!,
    roles,
    permissions,
  };
}

export function hasPermission(ctx: SessionContext | null, key: string): boolean {
  return ctx?.permissions.has(key) ?? false;
}
