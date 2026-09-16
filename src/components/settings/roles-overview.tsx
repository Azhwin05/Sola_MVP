import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RoleRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  role_permissions: { count: number }[];
};

export function RolesOverview({ roles }: { roles: RoleRow[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Permissions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{role.name}</span>
                  {role.key === "owner" && <Badge variant="secondary">System</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
              <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                {role.role_permissions[0]?.count ?? 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
