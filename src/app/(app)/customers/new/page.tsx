import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/components/customers/customer-form";

export const metadata = { title: "New Customer" };

export default async function NewCustomerPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "customers.manage")) {
    redirect("/customers");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Customer" description="Create a customer profile once — it's reused across leads, proposals and projects." />
      <CustomerForm />
    </div>
  );
}
