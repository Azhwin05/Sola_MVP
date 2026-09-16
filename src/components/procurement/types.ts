import type { Tables } from "@/lib/types/database";

export type RfqWithProject = Tables<"rfqs"> & {
  project: { id: string; project_number: string } | null;
};

export type RfqItemRow = Tables<"rfq_items">;

export type RfqVendorRow = Tables<"rfq_vendors"> & {
  vendor: { id: string; name: string; category: string } | null;
};

export type QuoteItemRow = Tables<"rfq_vendor_quote_items">;

export type QuoteRow = Tables<"rfq_vendor_quotes"> & {
  vendor: { id: string; name: string } | null;
  items: QuoteItemRow[];
};
