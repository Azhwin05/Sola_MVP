export const BOM_CATEGORIES = [
  "modules",
  "inverter",
  "mounting_structure",
  "dc_cable",
  "ac_cable",
  "connectors",
  "earthing",
  "protection",
  "meters",
  "civil",
  "consumables",
  "other",
] as const;

export type BomCategory = (typeof BOM_CATEGORIES)[number];

export const BOM_CATEGORY_LABELS: Record<BomCategory, string> = {
  modules: "Modules",
  inverter: "Inverter",
  mounting_structure: "Mounting Structure",
  dc_cable: "DC Cable",
  ac_cable: "AC Cable",
  connectors: "Connectors",
  earthing: "Earthing",
  protection: "Protection",
  meters: "Meters",
  civil: "Civil",
  consumables: "Consumables",
  other: "Other",
};
