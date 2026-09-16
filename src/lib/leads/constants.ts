export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "site_survey",
  "engineering",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  site_survey: "Site Survey",
  engineering: "Engineering",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

/** Stages shown as Kanban columns, in pipeline order. Won/Lost are terminal and shown separately. */
export const LEAD_PIPELINE_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "site_survey",
  "engineering",
  "proposal_sent",
  "negotiation",
];

export const LEAD_PRIORITIES = ["low", "medium", "high"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PROJECT_TYPES = ["residential", "commercial", "industrial", "warehouse", "institutional"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  warehouse: "Warehouse",
  institutional: "Institutional",
};

export const ACTIVITY_TYPES = ["call", "email", "meeting", "whatsapp", "site_visit", "stage_change", "note"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  site_visit: "Site Visit",
  stage_change: "Stage Change",
  note: "Note",
};
