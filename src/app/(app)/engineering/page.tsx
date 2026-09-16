import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Engineering" };

export default function EngineeringPage() {
  return (
    <ModuleComingSoon
      title="Engineering"
      phase="Phase 3"
      description="EB bill intelligence, capacity calculation engine, equipment selection and BOM generation."
    />
  );
}
