import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomerOverview } from "@/components/customers/customer-overview";
import { InlineComingSoon } from "@/components/shared/inline-coming-soon";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList, FileText } from "lucide-react";
import { CUSTOMER_TYPE_LABELS, type CustomerType } from "@/lib/customers/constants";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "customers.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "customers.manage");

  const supabase = await createClient();
  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (!customer) notFound();

  const [{ data: contacts }, { data: sites }, { data: leads }, { data: proposals }] = await Promise.all([
    supabase.from("customer_contacts").select("*").eq("customer_id", id).order("is_primary", { ascending: false }),
    supabase.from("customer_sites").select("*").eq("customer_id", id).order("created_at"),
    supabase.from("leads").select("id, lead_number, stage, estimated_value, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase
      .from("proposal_versions")
      .select("id, lead_id, proposal_number, version, status, total_amount, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        title={customer.name}
        actions={<Badge variant="secondary">{CUSTOMER_TYPE_LABELS[customer.customer_type as CustomerType]}</Badge>}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads {leads && leads.length > 0 ? `(${leads.length})` : ""}</TabsTrigger>
          <TabsTrigger value="proposals">Proposals {proposals && proposals.length > 0 ? `(${proposals.length})` : ""}</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <CustomerOverview customer={customer} contacts={contacts ?? []} sites={sites ?? []} canManage={canManage} />
        </TabsContent>

        <TabsContent value="leads" className="pt-6">
          {!leads || leads.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No leads linked yet" description="Leads convert into this customer record when they're linked or won." />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/leads/${lead.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.lead_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.estimated_value && (
                        <span className="text-sm tabular-nums text-muted-foreground">
                          ₹{lead.estimated_value.toLocaleString("en-IN")}
                        </span>
                      )}
                      <StatusBadge status={lead.stage} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="pt-6">
          {!proposals || proposals.length === 0 ? (
            <EmptyState icon={FileText} title="No proposals yet" description="Proposals sent to this customer will show up here." />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {proposals.map((p) => (
                <li key={p.id}>
                  <Link href={`/proposals/${p.lead_id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {p.proposal_number} v{p.version}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.total_amount != null && (
                        <span className="text-sm tabular-nums text-muted-foreground">₹{p.total_amount.toLocaleString("en-IN")}</span>
                      )}
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="finance" className="pt-6">
          <InlineComingSoon label="Invoices & payments" phase="Phase 7" />
        </TabsContent>
        <TabsContent value="documents" className="pt-6">
          <InlineComingSoon label="Documents" phase="Phase 8" />
        </TabsContent>
        <TabsContent value="service" className="pt-6">
          <InlineComingSoon label="Service history" phase="Phase 9" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
