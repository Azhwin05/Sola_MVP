import type { Tables } from "@/lib/types/database";

export type LeadRow = Tables<"leads"> & {
  owner: { id: string; full_name: string } | null;
  source: { name: string } | null;
};

export type LeadDetail = Tables<"leads"> & {
  owner: { id: string; full_name: string } | null;
  source: { id: string; name: string } | null;
  customer: { id: string; name: string } | null;
  site: { id: string; label: string } | null;
};
