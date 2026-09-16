import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Leads & CRM" };

export default function LeadsPage() {
  return (
    <ModuleComingSoon
      title="Leads & CRM"
      phase="Phase 2"
      description="Pipeline stages from New through Won/Lost, lead scoring, and activity tracking."
    />
  );
}
