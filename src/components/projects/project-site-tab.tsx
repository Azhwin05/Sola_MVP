import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProjectWithRelations } from "@/components/projects/types";

type Address = { line1?: string; city?: string; state?: string; pincode?: string };

export function ProjectSiteTab({ project }: { project: ProjectWithRelations }) {
  if (!project.site) {
    return <EmptyState icon={MapPin} title="No site linked" description="Link a customer site to this project to see it here." />;
  }

  const address = (project.site.address as Address) ?? {};

  return (
    <div className="max-w-md rounded-lg border border-border p-4">
      <p className="text-sm font-medium text-foreground">{project.site.label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {[address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ") || "No address on file"}
      </p>
    </div>
  );
}
