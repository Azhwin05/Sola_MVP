import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CustomersTable } from "@/components/customers/customers-table";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "customers.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "customers.manage");

  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*, contacts:customer_contacts(count), sites:customer_sites(count), leads:leads(count)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers?.length ?? 0} customer${(customers?.length ?? 0) === 1 ? "" : "s"}`}
        actions={
          canManage && (
            <Button size="sm" render={<Link href="/customers/new" />}>
              <Plus className="h-4 w-4" />
              New Customer
            </Button>
          )
        }
      />
      <CustomersTable customers={customers ?? []} />
    </div>
  );
}
