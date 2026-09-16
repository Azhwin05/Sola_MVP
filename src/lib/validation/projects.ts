import { z } from "zod";

export const projectCreateSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  lead_id: z.string().uuid().optional().nullable(),
  site_id: z.string().uuid().optional().nullable(),
  pm_id: z.string().uuid().optional().nullable(),
  capacity_kwp: z.string().optional().or(z.literal("")),
  contract_value: z.string().optional().or(z.literal("")),
  target_cod: z.string().optional().or(z.literal("")),
});

export type ProjectCreateValues = z.infer<typeof projectCreateSchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().nullable(),
  team: z.string().trim().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const riskFormSchema = z.object({
  risk: z.string().trim().min(1, "Describe the risk"),
  impact: z.enum(["low", "medium", "high"]),
  probability: z.enum(["low", "medium", "high"]),
  mitigation: z.string().trim().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().or(z.literal("")),
});

export type RiskFormValues = z.infer<typeof riskFormSchema>;
