import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { PendingInvites } from "@/components/team/pending-invites";

export const metadata = { title: "Team" };

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default async function TeamPage() {
  const ctx = await getSessionContext();
  const supabase = await createClient();
  const canManage = hasPermission(ctx, "team.manage");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: userRoles } = await supabase.from("user_roles").select("user_id, roles(name, key)");

  const { data: roles } = await supabase
    .from("roles")
    .select("key, name")
    .order("name");

  const { data: invites } = canManage
    ? await supabase
        .from("organization_invites")
        .select("id, email, token, expires_at, accepted_at, roles(name)")
        .is("accepted_at", null)
        .order("created_at", { ascending: false })
    : { data: null };

  const rolesByUser = new Map<string, string[]>();
  for (const ur of userRoles ?? []) {
    if (!ur.roles) continue;
    const list = rolesByUser.get(ur.user_id) ?? [];
    list.push(ur.roles.name);
    rolesByUser.set(ur.user_id, list);
  }

  return (
    <div>
      <PageHeader
        title="Team"
        description={`${profiles?.length ?? 0} member${(profiles?.length ?? 0) === 1 ? "" : "s"} in your organization`}
        actions={canManage && roles ? <InviteMemberDialog roles={roles} /> : undefined}
      />

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(profiles ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{initials(p.full_name) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(rolesByUser.get(p.id) ?? []).map((r) => (
                      <Badge key={r} variant="secondary">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="capitalize text-sm text-muted-foreground">{p.status}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {canManage && invites && invites.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Pending Invites</h2>
          <PendingInvites invites={invites} />
        </div>
      )}
    </div>
  );
}
