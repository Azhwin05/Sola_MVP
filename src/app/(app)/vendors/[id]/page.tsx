import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VendorOverview } from "@/components/vendors/vendor-overview";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";
import { VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/vendors/constants";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "vendors.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "vendors.manage");

  const supabase = await createClient();
  const { data: vendor } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
  if (!vendor) notFound();

  const [{ data: contacts }, { data: rfqLinks }] = await Promise.all([
    supabase.from("vendor_contacts").select("*").eq("vendor_id", id).order("is_primary", { ascending: false }),
    supabase
      .from("rfq_vendors")
      .select("status, rfq:rfqs(id, rfq_number, title, status, created_at)")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false, referencedTable: "rfqs" }),
  ]);

  return (
    <div>
      <PageHeader
        title={vendor.name}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory]}</Badge>
            <StatusBadge status={vendor.status} />
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs {rfqLinks && rfqLinks.length > 0 ? `(${rfqLinks.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <VendorOverview vendor={vendor} contacts={contacts ?? []} canManage={canManage} />
        </TabsContent>

        <TabsContent value="rfqs" className="pt-6">
          {!rfqLinks || rfqLinks.length === 0 ? (
            <EmptyState icon={FileText} title="No RFQs yet" description="RFQs this vendor is invited to quote on will show up here." />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rfqLinks.map(
                (link) =>
                  link.rfq && (
                    <li key={link.rfq.id}>
                      <Link href={`/procurement/${link.rfq.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {link.rfq.rfq_number} · {link.rfq.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(link.rfq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={link.status} />
                          <StatusBadge status={link.rfq.status} />
                        </div>
                      </Link>
                    </li>
                  ),
              )}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
