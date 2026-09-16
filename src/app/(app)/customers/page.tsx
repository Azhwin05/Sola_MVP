import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <ModuleComingSoon
      title="Customers"
      phase="Phase 2"
      description="Customer profiles with linked projects, proposals, invoices and service history."
    />
  );
}
