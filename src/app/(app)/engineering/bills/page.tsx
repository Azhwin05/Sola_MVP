import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EbBillsManager } from "@/components/engineering/eb-bills-manager";

export const metadata = { title: "EB Bills" };

export default async function EbBillsPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "engineering.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "engineering.manage");

  const supabase = await createClient();
  const [{ data: bills }, { data: customers }] = await Promise.all([
    supabase
      .from("eb_bills")
      .select("*, customer:customers(id, name)")
      .order("billing_month", { ascending: false })
      .limit(300),
    supabase.from("customers").select("id, name").order("name"),
  ]);

  return (
    <div>
      <PageHeader title="EB Bills" description="12-month consumption history behind every capacity calculation." />
      <EbBillsManager bills={bills ?? []} customers={customers ?? []} canManage={canManage} />
    </div>
  );
}
