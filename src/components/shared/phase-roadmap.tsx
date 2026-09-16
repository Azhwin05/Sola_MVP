import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { name: "Foundation", detail: "Auth, org & roles, design system, navigation, audit log", status: "done" },
  { name: "Core Sales", detail: "Leads, customers, activities, site scheduling", status: "done" },
  { name: "Survey + Engineering", detail: "Site surveys, EB bills, capacity calculations, BOM", status: "done" },
  { name: "Proposal + Project", detail: "Proposal engine, versioning, project passport", status: "in_progress" },
  { name: "Procurement + Inventory", detail: "Vendors, RFQs, POs, GRN, inventory", status: "pending" },
  { name: "Execution", detail: "Installation, field updates, QA, commissioning", status: "pending" },
  { name: "Finance", detail: "Invoices, payments, project profitability", status: "pending" },
  { name: "Customer", detail: "Customer portal, documents, notifications", status: "pending" },
  { name: "Monitoring + O&M", detail: "Telemetry adapters, alerts, service tickets, AMC", status: "pending" },
  { name: "Intelligence", detail: "Analytics, Control Tower refinement, AI Copilot", status: "pending" },
] as const;

export function PhaseRoadmap() {
  return (
    <ol className="space-y-1.5 rounded-lg border border-border bg-card p-2">
      {PHASES.map((phase, i) => (
        <li key={phase.name} className="flex items-start gap-3 rounded-md px-2 py-1.5">
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
              phase.status === "done" && "border-success bg-success/10 text-success",
              phase.status === "in_progress" && "border-info bg-info/10 text-info",
              phase.status === "pending" && "border-border text-muted-foreground",
            )}
          >
            {phase.status === "done" ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {phase.name}
              {phase.status === "in_progress" && (
                <span className="ml-2 text-xs font-normal text-info">In progress</span>
              )}
              {phase.status === "done" && (
                <span className="ml-2 text-xs font-normal text-success">Done</span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{phase.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
