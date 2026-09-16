import { redirect } from "next/navigation";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { VendorForm } from "@/components/vendors/vendor-form";

export const metadata = { title: "New Vendor" };

export default async function NewVendorPage() {
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "vendors.manage")) {
    redirect("/vendors");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Vendor" description="Add a supplier or contractor to invite on future RFQs." />
      <VendorForm />
    </div>
  );
}
