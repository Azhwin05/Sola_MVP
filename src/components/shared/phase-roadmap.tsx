import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { name: "Foundation", detail: "Auth, org & roles, design system, navigation, audit log", status: "done" },
  { name: "Core Sales", detail: "Leads, customers, activities, site scheduling", status: "done" },
  { name: "Survey + Engineering", detail: "Site surveys, EB bills, capacity calculations, BOM", status: "done" },
  { name: "Proposal + Project", detail: "Proposal engine, versioning, project passport", status: "done" },
  { name: "Procurement + Inventory", detail: "Vendors, RFQs, POs, GRN, inventory", status: "in_progress" },
  { name: "Execution", detail: "Installation, field updates, QA, commissioning", status: "pending" },
  { name: "Finance", detail: "Invoices, payments, project profitability", status: "pending" },
  { name: "Customer", detail: "Customer portal, documents, notifications", status: "pending" },
  { name: "Monitoring + O&M", detail: "Telemetry adapters, alerts, service tickets, AMC", status: "pending" },
  { name: "Intelligence", detail: "Analytics, Control Tower refinement, AI Copilot", status: "pending" },
] as const;

export function PhaseRoadmap() {
  return (
    <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-xs sm:grid-cols-2 lg:grid-cols-5">
      {PHASES.map((phase, i) => (
        <li key={phase.name} className="flex flex-col gap-2 bg-card p-3.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                phase.status === "done" && "border-success bg-success text-success-foreground",
                phase.status === "in_progress" && "border-primary bg-primary-light text-primary",
                phase.status === "pending" && "border-border-strong text-subtle",
              )}
            >
              {phase.status === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            {phase.status === "in_progress" && (
              <span className="rounded-md bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark dark:text-primary">
                In progress
              </span>
            )}
            {phase.status === "done" && (
              <span className="text-[10px] font-semibold tracking-wide text-success uppercase">Done</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] leading-snug font-medium text-foreground">{phase.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-subtle">{phase.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
