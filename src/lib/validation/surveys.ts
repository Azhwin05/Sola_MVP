import { z } from "zod";

export const surveyCreateSchema = z.object({
  lead_id: z.string().uuid("Select a lead"),
  site_id: z.string().uuid("Select a site"),
  engineer_id: z.string().uuid().optional().nullable(),
  survey_date: z.string().min(1, "Survey date is required"),
  roof_type: z.string().trim().optional().or(z.literal("")),
});

export type SurveyCreateValues = z.infer<typeof surveyCreateSchema>;
