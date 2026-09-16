import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RfqsTable } from "@/components/procurement/rfqs-table";

export const metadata = { title: "Procurement" };

export default async function ProcurementPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "procurement.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "procurement.manage");

  const supabase = await createClient();
  const { data: rfqs } = await supabase
    .from("rfqs")
    .select("*, project:projects(project_number), vendors:rfq_vendors(count)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Procurement"
        description={`${rfqs?.length ?? 0} RFQ${(rfqs?.length ?? 0) === 1 ? "" : "s"} · purchase orders land in a later phase`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/procurement/new" />}>
              <Plus className="h-4 w-4" />
              New RFQ
            </Button>
          )
        }
      />
      <RfqsTable rfqs={rfqs ?? []} />
    </div>
  );
}
