import type { ProjectStatus } from "@/lib/projects/constants";

export type ProjectHealth = "healthy" | "at_risk" | "delayed" | "blocked";

export type ProjectHealthInputs = {
  status: ProjectStatus;
  targetCod: string | null;
  today?: Date;
  overdueTaskCount: number;
  openRisks: { impact: "low" | "medium" | "high" }[];
};

export type ProjectHealthResult = {
  health: ProjectHealth;
  reasons: string[];
};

const TERMINAL_STATUSES: ProjectStatus[] = ["operational", "handover", "cancelled"];
const EARLY_STATUSES: ProjectStatus[] = ["planning", "engineering", "procurement"];

/**
 * Deterministic project health, computed from real signals only —
 * overdue tasks, open risks, and schedule vs. target COD. No project ever
 * silently disappears without a reason shown alongside its color.
 */
export function calculateProjectHealth(inputs: ProjectHealthInputs): ProjectHealthResult {
  const { status, targetCod, overdueTaskCount, openRisks } = inputs;
  const today = inputs.today ?? new Date(new Date().toDateString());
  const reasons: string[] = [];

  const highRisks = openRisks.filter((r) => r.impact === "high");
  if (highRisks.length > 0) {
    reasons.push(`${highRisks.length} open high-impact risk${highRisks.length === 1 ? "" : "s"}`);
    return { health: "blocked", reasons };
  }

  const isTerminal = TERMINAL_STATUSES.includes(status);
  const daysToTarget = targetCod
    ? Math.ceil((new Date(targetCod).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (!isTerminal && daysToTarget !== null && daysToTarget < 0) {
    reasons.push(`Target COD passed ${Math.abs(daysToTarget)} day${Math.abs(daysToTarget) === 1 ? "" : "s"} ago`);
    return { health: "delayed", reasons };
  }

  if (overdueTaskCount > 0) {
    reasons.push(`${overdueTaskCount} overdue task${overdueTaskCount === 1 ? "" : "s"}`);
  }
  if (!isTerminal && daysToTarget !== null && daysToTarget <= 14 && EARLY_STATUSES.includes(status)) {
    reasons.push(`Target COD in ${daysToTarget} day${daysToTarget === 1 ? "" : "s"} but still in ${status}`);
  }
  const mediumOrLowRisks = openRisks.length - highRisks.length;
  if (mediumOrLowRisks > 0) {
    reasons.push(`${mediumOrLowRisks} open risk${mediumOrLowRisks === 1 ? "" : "s"}`);
  }

  if (reasons.length > 0) {
    return { health: "at_risk", reasons };
  }

  return { health: "healthy", reasons: ["On track"] };
}
