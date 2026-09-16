import { z } from "zod";
import { LEAD_PRIORITIES, PROJECT_TYPES } from "@/lib/leads/constants";

export const leadFormSchema = z.object({
  contact_name: z.string().trim().min(1, "Contact name is required"),
  contact_phone: z.string().trim().optional().or(z.literal("")),
  contact_email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  company_name: z.string().trim().optional().or(z.literal("")),
  customer_id: z.string().uuid().optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  project_type: z.enum(PROJECT_TYPES),
  estimated_capacity_kwp: z.string().optional().or(z.literal("")),
  estimated_value: z.string().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().nullable(),
  priority: z.enum(LEAD_PRIORITIES),
  next_action: z.string().trim().optional().or(z.literal("")),
  next_action_date: z.string().optional().or(z.literal("")),
  expected_close_date: z.string().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
