import type { Tables } from "@/lib/types/database";

export type LeadWithCustomer = Tables<"leads"> & {
  customer: { id: string; name: string; gstin: string | null; billing_address: unknown } | null;
};

export type BomWithItems = Tables<"bom_headers"> & { items: Tables<"bom_items">[] };
export type RevisionWithBoms = Tables<"engineering_revisions"> & { boms: BomWithItems[] };
