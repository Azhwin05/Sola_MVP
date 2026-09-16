import type { CapacityOutputs } from "@/lib/engineering/capacity";
import type { BomCategory } from "@/lib/engineering/constants";

export type DraftBomItem = {
  category: BomCategory;
  item: string;
  specification: string;
  unit: string;
  quantity: number;
  wastage_percent: number;
  estimated_rate: number;
  sort_order: number;
};

/**
 * Produces a starting BOM from a capacity result. Quantities for cabling and
 * connectors are rough per-panel/per-kWp heuristics, not a layout takeoff —
 * every such item is flagged in its specification so the design engineer
 * knows to refine it, rather than presenting a guess as a final number.
 * Rates default to 0: no vendor pricing is assumed or fabricated.
 */
export function generateDefaultBom(moduleWattageWp: number, capacity: CapacityOutputs): DraftBomItem[] {
  const { panelQty, actualKwp, inverterSizingKw } = capacity;

  return [
    {
      category: "modules",
      item: `Solar PV Module, ${moduleWattageWp} Wp`,
      specification: "Mono PERC / TopCon — confirm brand & tier with procurement",
      unit: "nos",
      quantity: panelQty,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 1,
    },
    {
      category: "inverter",
      item: "Grid-tie String Inverter",
      specification: `${inverterSizingKw} kW — split into multiple units if unavailable at this rating`,
      unit: "nos",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 2,
    },
    {
      category: "mounting_structure",
      item: "Mounting Structure (GI/Aluminium)",
      specification: "Sized per roof type — confirm wind load rating",
      unit: "kWp",
      quantity: round1(actualKwp),
      wastage_percent: 5,
      estimated_rate: 0,
      sort_order: 3,
    },
    {
      category: "dc_cable",
      item: "DC Solar Cable, 4mm²",
      specification: "Auto-estimated at 10m/panel — refine after layout design",
      unit: "meters",
      quantity: panelQty * 10,
      wastage_percent: 5,
      estimated_rate: 0,
      sort_order: 4,
    },
    {
      category: "ac_cable",
      item: "AC Cable",
      specification: "Auto-estimated at 5m/kW inverter — refine after layout design",
      unit: "meters",
      quantity: round1(inverterSizingKw * 5),
      wastage_percent: 5,
      estimated_rate: 0,
      sort_order: 5,
    },
    {
      category: "connectors",
      item: "MC4 Connector Pairs",
      specification: "One pair per panel",
      unit: "pairs",
      quantity: panelQty,
      wastage_percent: 2,
      estimated_rate: 0,
      sort_order: 6,
    },
    {
      category: "earthing",
      item: "Earthing Kit",
      specification: "Lightning arrestor + earth pits per local code",
      unit: "set",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 7,
    },
    {
      category: "protection",
      item: "DC/AC Surge Protection & Isolators",
      specification: "Per inverter and array string configuration",
      unit: "set",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 8,
    },
    {
      category: "meters",
      item: "Bi-directional Net Meter",
      specification: "Confirm requirement with DISCOM",
      unit: "nos",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 9,
    },
    {
      category: "civil",
      item: "Civil Work",
      specification: "Foundation, cable trenching — lump sum",
      unit: "lot",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 10,
    },
    {
      category: "consumables",
      item: "Installation Consumables",
      specification: "Cable ties, lugs, tape, glands — lump sum",
      unit: "lot",
      quantity: 1,
      wastage_percent: 0,
      estimated_rate: 0,
      sort_order: 11,
    },
  ];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
