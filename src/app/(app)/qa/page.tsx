import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "QA/QC" };

export default function QaPage() {
  return (
    <ModuleComingSoon
      title="QA/QC"
      phase="Phase 6"
      description="Configurable inspection templates, pass/fail checklists and defect rectification."
    />
  );
}
