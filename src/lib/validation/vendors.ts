import { z } from "zod";
import { VENDOR_CATEGORIES } from "@/lib/vendors/constants";

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required"),
  category: z.enum(VENDOR_CATEGORIES),
  gstin: z.string().trim().optional().or(z.literal("")),
  payment_terms: z.string().trim().optional().or(z.literal("")),
  line1: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  pincode: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  contact_name: z.string().trim().optional().or(z.literal("")),
  contact_phone: z.string().trim().optional().or(z.literal("")),
  contact_email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
