import { z } from "zod";

export const rfqFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  source_id: z.string().trim().min(1, "Select a source project"),
  due_date: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  vendor_ids: z.array(z.string()).min(1, "Select at least one vendor"),
});

export type RfqFormValues = z.infer<typeof rfqFormSchema>;

export const quoteFormSchema = z.object({
  valid_until: z.string().trim().optional().or(z.literal("")),
  payment_terms: z.string().trim().optional().or(z.literal("")),
  delivery_lead_days: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  items: z.array(
    z.object({
      rfq_item_id: z.string(),
      quoted_rate: z.string().trim().optional().or(z.literal("")),
    }),
  ),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
