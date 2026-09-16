import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Commissioning" };

export default function CommissioningPage() {
  return (
    <ModuleComingSoon
      title="Commissioning"
      phase="Phase 6"
      description="Commissioning checklist, readings, evidence and customer handover package."
    />
  );
}
