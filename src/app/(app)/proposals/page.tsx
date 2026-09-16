import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Proposals" };

export default function ProposalsPage() {
  return (
    <ModuleComingSoon
      title="Proposals"
      phase="Phase 4"
      description="Versioned proposal builder with live document preview and branded PDF generation."
    />
  );
}
