import { z } from "zod";

export const proposalFormSchema = z.object({
  engineering_revision_id: z.string().uuid().optional().nullable(),
  bom_header_id: z.string().uuid().optional().nullable(),
  equipment_cost: z.string().min(1, "Required"),
  installation_cost: z.string().optional().or(z.literal("")),
  other_cost: z.string().optional().or(z.literal("")),
  discount: z.string().optional().or(z.literal("")),
  tax_rate_percent: z.string().optional().or(z.literal("")),
  is_interstate: z.boolean(),
  payment_terms: z.string().trim().optional().or(z.literal("")),
  warranty_equipment_years: z.string().optional().or(z.literal("")),
  warranty_workmanship_years: z.string().optional().or(z.literal("")),
  scope: z.string().trim().optional().or(z.literal("")),
  exclusions: z.string().trim().optional().or(z.literal("")),
  assumptions: z.string().trim().optional().or(z.literal("")),
  change_summary: z.string().trim().optional().or(z.literal("")),
});

export type ProposalFormValues = z.infer<typeof proposalFormSchema>;
