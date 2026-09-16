import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export function ModuleComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title={`${title} is scheduled for ${phase}`}
        description={description}
      />
    </div>
  );
}
