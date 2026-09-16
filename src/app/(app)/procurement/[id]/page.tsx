import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RfqActions } from "@/components/procurement/rfq-actions";
import { RfqItemsTable } from "@/components/procurement/rfq-items-table";
import { RfqVendorsPanel } from "@/components/procurement/rfq-vendors-panel";
import type { RfqVendorRow, QuoteRow } from "@/components/procurement/types";

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "procurement.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "procurement.manage");

  const supabase = await createClient();
  const { data: rfq } = await supabase
    .from("rfqs")
    .select("*, project:projects(id, project_number)")
    .eq("id", id)
    .maybeSingle();
  if (!rfq) notFound();

  const [{ data: items }, { data: rfqVendors }, { data: quotes }] = await Promise.all([
    supabase.from("rfq_items").select("*").eq("rfq_id", id).order("sort_order"),
    supabase.from("rfq_vendors").select("*, vendor:vendors(id, name, category)").eq("rfq_id", id),
    supabase
      .from("rfq_vendor_quotes")
      .select("*, vendor:vendors(id, name), items:rfq_vendor_quote_items(*)")
      .eq("rfq_id", id),
  ]);

  return (
    <div>
      <PageHeader
        title={rfq.title}
        description={rfq.rfq_number}
        actions={<StatusBadge status={rfq.status} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {rfq.project && (
          <Link href={`/projects/${rfq.project.id}`} className="text-foreground underline">
            {rfq.project.project_number}
          </Link>
        )}
        {rfq.due_date && (
          <span>Due {new Date(rfq.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        )}
      </div>

      {canManage && (
        <div className="mb-6">
          <RfqActions rfq={rfq} />
        </div>
      )}

      {rfq.notes && (
        <div className="mb-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{rfq.notes}</div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Equipment</h2>
          <RfqItemsTable items={items ?? []} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Vendors & quotes</h2>
          <RfqVendorsPanel
            rfq={rfq}
            items={items ?? []}
            rfqVendors={(rfqVendors ?? []) as RfqVendorRow[]}
            quotes={(quotes ?? []) as QuoteRow[]}
            canManage={canManage}
          />
        </section>
      </div>
    </div>
  );
}
