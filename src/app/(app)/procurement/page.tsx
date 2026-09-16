import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Procurement" };

export default function ProcurementPage() {
  return (
    <ModuleComingSoon
      title="Procurement"
      phase="Phase 5"
      description="RFQs, vendor quote comparison, and purchase order approvals traced back to BOM."
    />
  );
}
