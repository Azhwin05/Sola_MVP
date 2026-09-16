/**
 * Deterministic solar capacity calculation. Every output is derived from the
 * inputs by a fixed formula — nothing here is a model prediction, and every
 * assumption used is returned alongside the result so it can be shown to the
 * user rather than hidden (per the product spec: "never hide calculation
 * assumptions", "do not present score as an AI certainty").
 */

export const CAPACITY_DEFAULTS = {
  /** Typical rooftop area needed per kWp of installed capacity, incl. walkways/spacing. */
  areaPerKwpSqm: 7,
  /** Combined inverter/cable/soiling/temperature system losses. */
  systemLossPercent: 15,
  /** Standard module wattage assumption; user can override per project. */
  moduleWattageWp: 550,
  /** DC:AC oversizing ratio used to size the inverter relative to array capacity. */
  dcAcRatio: 1.1,
};

export type CapacityInputs = {
  /** Monthly consumption in kWh, most recent first — typically 12 months of EB bill data. */
  monthlyConsumptionKwh: number[];
  availableRoofAreaSqm: number;
  desiredOffsetPercent: number;
  irradiationKwhPerKwpPerDay: number;
  systemLossPercent: number;
  moduleWattageWp: number;
  tariffRatePerKwh: number;
};

export type CapacityOutputs = {
  avgMonthlyConsumptionKwh: number;
  targetAnnualGenerationKwh: number;
  areaConstrained: boolean;
  recommendedKwp: number;
  panelQty: number;
  actualKwp: number;
  inverterSizingKw: number;
  estimatedAnnualGenerationKwh: number;
  estimatedAnnualSavings: number;
  assumptions: string[];
};

export function calculateCapacity(inputs: CapacityInputs): CapacityOutputs {
  const {
    monthlyConsumptionKwh,
    availableRoofAreaSqm,
    desiredOffsetPercent,
    irradiationKwhPerKwpPerDay,
    systemLossPercent,
    moduleWattageWp,
    tariffRatePerKwh,
  } = inputs;

  const avgMonthlyConsumptionKwh =
    monthlyConsumptionKwh.length > 0
      ? monthlyConsumptionKwh.reduce((sum, v) => sum + v, 0) / monthlyConsumptionKwh.length
      : 0;

  const targetAnnualGenerationKwh = avgMonthlyConsumptionKwh * 12 * (desiredOffsetPercent / 100);

  const lossFactor = 1 - systemLossPercent / 100;
  const generationPerKwpPerYear = irradiationKwhPerKwpPerDay * 365 * lossFactor;

  let recommendedKwp = generationPerKwpPerYear > 0 ? targetAnnualGenerationKwh / generationPerKwpPerYear : 0;

  const areaRequiredSqm = recommendedKwp * CAPACITY_DEFAULTS.areaPerKwpSqm;
  const areaConstrained = availableRoofAreaSqm > 0 && areaRequiredSqm > availableRoofAreaSqm;
  if (areaConstrained) {
    recommendedKwp = availableRoofAreaSqm / CAPACITY_DEFAULTS.areaPerKwpSqm;
  }

  const panelQty = moduleWattageWp > 0 ? Math.round((recommendedKwp * 1000) / moduleWattageWp) : 0;
  const actualKwp = (panelQty * moduleWattageWp) / 1000;

  const inverterSizingKw = Math.round((actualKwp / CAPACITY_DEFAULTS.dcAcRatio) * 10) / 10;

  const estimatedAnnualGenerationKwh = actualKwp * generationPerKwpPerYear;
  const estimatedAnnualSavings = estimatedAnnualGenerationKwh * tariffRatePerKwh;

  const assumptions = [
    `Irradiation assumed at ${irradiationKwhPerKwpPerDay} kWh/kWp/day for this site.`,
    `System losses (inverter, cabling, soiling, temperature) assumed at ${systemLossPercent}%.`,
    `Module wattage assumed at ${moduleWattageWp} Wp per panel; panel count is rounded to a whole number.`,
    `Roof area budgeted at ${CAPACITY_DEFAULTS.areaPerKwpSqm} m² per kWp including walkways and spacing.`,
    `Inverter sized at a ${CAPACITY_DEFAULTS.dcAcRatio}:1 DC:AC ratio relative to array capacity.`,
    `Savings assume full self-consumption or net-metering credit at ₹${tariffRatePerKwh}/unit — actual savings depend on your utility's net-metering policy.`,
    ...(areaConstrained
      ? [`Capacity was capped by available roof area (${availableRoofAreaSqm} m²) rather than the consumption target.`]
      : []),
  ];

  return {
    avgMonthlyConsumptionKwh,
    targetAnnualGenerationKwh,
    areaConstrained,
    recommendedKwp,
    panelQty,
    actualKwp,
    inverterSizingKw,
    estimatedAnnualGenerationKwh,
    estimatedAnnualSavings,
    assumptions,
  };
}
