import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function ProjectProcurementTab({ projectId, canManage }: { projectId: string; canManage: boolean }) {
  const supabase = await createClient();
  const { data: rfqs } = await supabase
    .from("rfqs")
    .select("id, rfq_number, title, status, due_date, vendors:rfq_vendors(count)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (!rfqs || rfqs.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No RFQs yet"
        description="Create an RFQ from this project's BOM to start collecting vendor quotes."
        action={
          canManage && (
            <Button size="sm" render={<Link href="/procurement/new" />}>
              <Plus className="h-4 w-4" />
              New RFQ
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" render={<Link href="/procurement/new" />}>
            <Plus className="h-4 w-4" />
            New RFQ
          </Button>
        </div>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rfqs.map((rfq) => (
          <li key={rfq.id}>
            <Link href={`/procurement/${rfq.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {rfq.rfq_number} · {rfq.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rfq.vendors[0]?.count ?? 0} vendor{(rfq.vendors[0]?.count ?? 0) === 1 ? "" : "s"} invited
                  {rfq.due_date && ` · due ${new Date(rfq.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </div>
              <StatusBadge status={rfq.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
