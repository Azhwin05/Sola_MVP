export const PROJECT_STATUSES = [
  "planning",
  "engineering",
  "procurement",
  "material_ready",
  "installation",
  "qa",
  "commissioning",
  "handover",
  "operational",
  "on_hold",
  "cancelled",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  engineering: "Engineering",
  procurement: "Procurement",
  material_ready: "Material Ready",
  installation: "Installation",
  qa: "QA",
  commissioning: "Commissioning",
  handover: "Handover",
  operational: "Operational",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
