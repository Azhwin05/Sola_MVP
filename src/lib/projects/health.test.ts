import { describe, it, expect } from "vitest";
import { calculateProjectHealth } from "./health";

const today = new Date("2026-06-15T00:00:00.000Z");

describe("calculateProjectHealth", () => {
  it("is healthy with no risks, no overdue tasks, and a comfortable target date", () => {
    const result = calculateProjectHealth({
      status: "installation",
      targetCod: "2026-09-01",
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.health).toBe("healthy");
  });

  it("is blocked by any open high-impact risk, regardless of anything else", () => {
    const result = calculateProjectHealth({
      status: "operational",
      targetCod: null,
      today,
      overdueTaskCount: 0,
      openRisks: [{ impact: "high" }],
    });
    expect(result.health).toBe("blocked");
    expect(result.reasons[0]).toMatch(/high-impact/);
  });

  it("is delayed when the target COD has already passed and the project isn't terminal", () => {
    const result = calculateProjectHealth({
      status: "installation",
      targetCod: "2026-06-01",
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.health).toBe("delayed");
  });

  it("does not flag a passed target COD as delayed once the project reaches a terminal status", () => {
    const result = calculateProjectHealth({
      status: "operational",
      targetCod: "2026-06-01",
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.health).toBe("healthy");
  });

  it("is at_risk when there are overdue tasks", () => {
    const result = calculateProjectHealth({
      status: "installation",
      targetCod: "2026-09-01",
      today,
      overdueTaskCount: 2,
      openRisks: [],
    });
    expect(result.health).toBe("at_risk");
    expect(result.reasons.some((r) => r.includes("2 overdue"))).toBe(true);
  });

  it("is at_risk when the target COD is imminent but the project is still in an early status", () => {
    const result = calculateProjectHealth({
      status: "planning",
      targetCod: "2026-06-20",
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.health).toBe("at_risk");
  });

  it("does not flag an imminent target COD as at_risk once past the early statuses", () => {
    const result = calculateProjectHealth({
      status: "commissioning",
      targetCod: "2026-06-20",
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.health).toBe("healthy");
  });

  it("is at_risk with only low/medium open risks (high risks would instead block)", () => {
    const result = calculateProjectHealth({
      status: "installation",
      targetCod: "2026-09-01",
      today,
      overdueTaskCount: 0,
      openRisks: [{ impact: "low" }, { impact: "medium" }],
    });
    expect(result.health).toBe("at_risk");
    expect(result.reasons.some((r) => r.includes("2 open risk"))).toBe(true);
  });

  it("always returns a non-empty reasons list, even when healthy", () => {
    const result = calculateProjectHealth({
      status: "planning",
      targetCod: null,
      today,
      overdueTaskCount: 0,
      openRisks: [],
    });
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
