import type { Tables } from "@/lib/types/database";

export type ProjectWithRelations = Tables<"projects"> & {
  customer: { id: string; name: string; billing_address: unknown } | null;
  site: { id: string; label: string; address: unknown } | null;
  pm: { id: string; full_name: string } | null;
  lead: { id: string; contact_name: string } | null;
};

export type MilestoneRow = Tables<"project_milestones"> & { owner: { id: string; full_name: string } | null };
export type TaskRow = Tables<"project_tasks"> & { owner: { id: string; full_name: string } | null };
export type RiskRow = Tables<"project_risks"> & { owner: { id: string; full_name: string } | null };
