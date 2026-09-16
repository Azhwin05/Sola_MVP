import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <ModuleComingSoon
      title="Finance"
      phase="Phase 7"
      description="Invoices, payments, GST handling and per-project profitability."
    />
  );
}
