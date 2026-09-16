import { z } from "zod";

export const ebBillFormSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  billing_month: z.string().min(1, "Billing month is required"),
  bill_number: z.string().trim().optional().or(z.literal("")),
  opening_reading: z.string().optional().or(z.literal("")),
  closing_reading: z.string().optional().or(z.literal("")),
  units_consumed: z.string().min(1, "Units consumed is required"),
  demand_kva: z.string().optional().or(z.literal("")),
  tariff_category: z.string().trim().optional().or(z.literal("")),
  amount: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  paid_status: z.enum(["paid", "unpaid", "partial"]),
});

export type EbBillFormValues = z.infer<typeof ebBillFormSchema>;
