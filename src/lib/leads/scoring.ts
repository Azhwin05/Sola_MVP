import type { Tables } from "@/lib/types/database";

export type ScoreFactor = {
  label: string;
  points: number;
  max: number;
  explanation: string;
};

export type LeadScore = {
  score: number;
  factors: ScoreFactor[];
};

const PROJECT_TYPE_WEIGHT: Record<string, number> = {
  industrial: 15,
  commercial: 12,
  warehouse: 10,
  institutional: 10,
  residential: 6,
};

/**
 * Deterministic, explainable lead score (0-100) — a weighted sum of deal
 * signals, not a prediction. Every point is traceable to a field on the
 * lead so it can be shown to the user as "why", never as a bare number.
 */
export function scoreLead(
  lead: Pick<
    Tables<"leads">,
    | "estimated_value"
    | "estimated_capacity_kwp"
    | "project_type"
    | "expected_close_date"
    | "contact_email"
    | "contact_phone"
    | "source_id"
    | "site_id"
    | "next_action"
    | "next_action_date"
  >,
): LeadScore {
  const factors: ScoreFactor[] = [];

  const valuePoints = Math.round(Math.min(30, ((lead.estimated_value ?? 0) / 5_000_000) * 30));
  factors.push({
    label: "Deal value",
    points: valuePoints,
    max: 30,
    explanation: lead.estimated_value
      ? `Estimated value ₹${lead.estimated_value.toLocaleString("en-IN")} (scales up to ₹50L)`
      : "No estimated value entered yet",
  });

  const capacityPoints = Math.round(Math.min(20, ((lead.estimated_capacity_kwp ?? 0) / 100) * 20));
  factors.push({
    label: "System size",
    points: capacityPoints,
    max: 20,
    explanation: lead.estimated_capacity_kwp
      ? `Estimated ${lead.estimated_capacity_kwp} kWp (scales up to 100 kWp)`
      : "No estimated capacity entered yet",
  });

  const typePoints = PROJECT_TYPE_WEIGHT[lead.project_type] ?? 6;
  factors.push({
    label: "Project type",
    points: typePoints,
    max: 15,
    explanation: `${lead.project_type[0].toUpperCase()}${lead.project_type.slice(1)} projects typically weigh ${typePoints}/15`,
  });

  let timelinePoints = 0;
  let timelineExplanation = "No expected close date entered yet";
  if (lead.expected_close_date) {
    const days = Math.ceil(
      (new Date(lead.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days <= 30) {
      timelinePoints = 15;
      timelineExplanation = `Closing within ${Math.max(days, 0)} days`;
    } else if (days <= 90) {
      timelinePoints = 10;
      timelineExplanation = `Closing within ${days} days`;
    } else if (days <= 180) {
      timelinePoints = 5;
      timelineExplanation = `Closing within ${days} days`;
    } else {
      timelineExplanation = `Closing in ${days} days — beyond the near-term window`;
    }
  }
  factors.push({ label: "Timeline urgency", points: timelinePoints, max: 15, explanation: timelineExplanation });

  const completenessFields = [
    lead.contact_email,
    lead.contact_phone,
    lead.source_id,
    lead.site_id,
    lead.estimated_capacity_kwp,
    lead.estimated_value,
    lead.expected_close_date,
    lead.next_action && lead.next_action_date,
  ];
  const filled = completenessFields.filter(Boolean).length;
  const completenessPoints = Math.round((filled / completenessFields.length) * 20);
  factors.push({
    label: "Qualification completeness",
    points: completenessPoints,
    max: 20,
    explanation: `${filled} of ${completenessFields.length} key fields filled in`,
  });

  const score = factors.reduce((sum, f) => sum + f.points, 0);

  return { score, factors };
}
