export const VENDOR_CATEGORIES = [
  "module",
  "inverter",
  "structure",
  "electrical",
  "bos",
  "logistics",
  "installation_contractor",
  "other",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  module: "Modules",
  inverter: "Inverters",
  structure: "Structure / BOS",
  electrical: "Electrical / Cabling",
  bos: "Balance of System",
  logistics: "Logistics",
  installation_contractor: "Installation Contractor",
  other: "Other",
};

export const VENDOR_STATUSES = ["active", "inactive"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
