import { describe, it, expect } from "vitest";
import { calculateCapacity, CAPACITY_DEFAULTS } from "./capacity";

const baseInputs = {
  monthlyConsumptionKwh: Array(12).fill(1000),
  availableRoofAreaSqm: 1000,
  desiredOffsetPercent: 90,
  irradiationKwhPerKwpPerDay: 4.5,
  systemLossPercent: CAPACITY_DEFAULTS.systemLossPercent,
  moduleWattageWp: CAPACITY_DEFAULTS.moduleWattageWp,
  tariffRatePerKwh: 8,
};

describe("calculateCapacity", () => {
  it("computes average consumption from the monthly series", () => {
    const out = calculateCapacity(baseInputs);
    expect(out.avgMonthlyConsumptionKwh).toBe(1000);
  });

  it("targets the desired offset of annual consumption", () => {
    const out = calculateCapacity(baseInputs);
    // 1000 kWh/mo * 12 * 90% = 10,800 kWh target
    expect(out.targetAnnualGenerationKwh).toBeCloseTo(10800, 5);
  });

  it("sizes capacity from the target generation and derates for losses", () => {
    const out = calculateCapacity(baseInputs);
    const generationPerKwpPerYear = 4.5 * 365 * (1 - 15 / 100);
    const expectedKwp = 10800 / generationPerKwpPerYear;
    expect(out.recommendedKwp).toBeCloseTo(expectedKwp, 5);
    expect(out.areaConstrained).toBe(false);
  });

  it("rounds panel count to a whole number and recomputes actual kWp from it", () => {
    const out = calculateCapacity(baseInputs);
    expect(Number.isInteger(out.panelQty)).toBe(true);
    expect(out.actualKwp).toBeCloseTo((out.panelQty * baseInputs.moduleWattageWp) / 1000, 10);
  });

  it("caps capacity by available roof area when consumption target would exceed it", () => {
    const out = calculateCapacity({ ...baseInputs, availableRoofAreaSqm: 10 });
    expect(out.areaConstrained).toBe(true);
    expect(out.recommendedKwp).toBeCloseTo(10 / CAPACITY_DEFAULTS.areaPerKwpSqm, 5);
    expect(out.assumptions.some((a) => a.includes("capped by available roof area"))).toBe(true);
  });

  it("sizes the inverter below array capacity per the DC:AC ratio", () => {
    const out = calculateCapacity(baseInputs);
    expect(out.inverterSizingKw).toBeLessThan(out.actualKwp);
    expect(out.inverterSizingKw).toBeCloseTo(out.actualKwp / CAPACITY_DEFAULTS.dcAcRatio, 1);
  });

  it("estimates annual savings as generation times tariff rate", () => {
    const out = calculateCapacity(baseInputs);
    expect(out.estimatedAnnualSavings).toBeCloseTo(out.estimatedAnnualGenerationKwh * baseInputs.tariffRatePerKwh, 5);
  });

  it("returns zeroed output for an empty consumption history rather than throwing", () => {
    const out = calculateCapacity({ ...baseInputs, monthlyConsumptionKwh: [] });
    expect(out.avgMonthlyConsumptionKwh).toBe(0);
    expect(out.recommendedKwp).toBe(0);
    expect(out.panelQty).toBe(0);
  });

  it("explains every assumption it used, never hiding them", () => {
    const out = calculateCapacity(baseInputs);
    expect(out.assumptions.length).toBeGreaterThan(0);
    expect(out.assumptions.some((a) => a.includes(`${baseInputs.irradiationKwhPerKwpPerDay}`))).toBe(true);
    expect(out.assumptions.some((a) => a.includes(`${baseInputs.moduleWattageWp}`))).toBe(true);
  });
});
