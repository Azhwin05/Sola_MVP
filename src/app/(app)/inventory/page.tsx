import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <ModuleComingSoon
      title="Inventory"
      phase="Phase 5"
      description="Stock levels, goods receipt, and project material allocation with full traceability."
    />
  );
}
