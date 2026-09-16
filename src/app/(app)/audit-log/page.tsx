import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Audit Log" };

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, metadata, actor:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Audit Log" description="Append-only record of important actions across your organization." />

      {!logs || logs.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" description="Actions like invites, approvals and record changes will appear here as they happen." />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{log.actor?.full_name ?? "System"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {log.entity_type.replace(/_/g, " ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
