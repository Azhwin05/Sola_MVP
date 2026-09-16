export const CUSTOMER_TYPES = ["residential", "commercial", "industrial", "warehouse", "institutional"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  warehouse: "Warehouse",
  institutional: "Institutional",
};
