import { z } from "zod";
import { CUSTOMER_TYPES } from "@/lib/customers/constants";

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Company / customer name is required"),
  customer_type: z.enum(CUSTOMER_TYPES),
  gstin: z.string().trim().optional().or(z.literal("")),
  line1: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  pincode: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  contact_name: z.string().trim().optional().or(z.literal("")),
  contact_phone: z.string().trim().optional().or(z.literal("")),
  contact_email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
