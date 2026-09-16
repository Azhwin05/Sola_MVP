import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Customer Portal" };

export default function PortalPage() {
  return (
    <ModuleComingSoon
      title="Customer Portal"
      phase="Phase 8"
      description="A dedicated customer-facing view of project progress, documents, payments and service."
    />
  );
}
