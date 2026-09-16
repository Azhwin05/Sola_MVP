import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "O&M / AMC" };

export default function OmPage() {
  return (
    <ModuleComingSoon
      title="O&M / AMC"
      phase="Phase 9"
      description="Service tickets, AMC contracts, warranty tracking and SLA management."
    />
  );
}
