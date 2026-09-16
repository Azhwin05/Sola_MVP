import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VendorsTable } from "@/components/vendors/vendors-table";

export const metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "vendors.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "vendors.manage");

  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("*, contacts:vendor_contacts(count), rfqs:rfq_vendors(count)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Vendors"
        description={`${vendors?.length ?? 0} vendor${(vendors?.length ?? 0) === 1 ? "" : "s"}`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/vendors/new" />}>
              <Plus className="h-4 w-4" />
              New Vendor
            </Button>
          )
        }
      />
      <VendorsTable vendors={vendors ?? []} />
    </div>
  );
}
