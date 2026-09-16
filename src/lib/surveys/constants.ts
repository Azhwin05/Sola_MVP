export const SURVEY_STATUSES = [
  "draft",
  "scheduled",
  "assigned",
  "in_progress",
  "submitted",
  "reviewed",
  "approved",
  "rework",
] as const;

export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  assigned: "Assigned",
  in_progress: "In Progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
  approved: "Approved",
  rework: "Needs Rework",
};

/** Ordered forward path a survey normally travels through. */
export const SURVEY_STATUS_ORDER: SurveyStatus[] = [
  "draft",
  "scheduled",
  "assigned",
  "in_progress",
  "submitted",
  "reviewed",
  "approved",
];

export const ORIENTATIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"] as const;
