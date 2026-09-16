import { createClient } from "@/lib/supabase/client";

export const PROJECT_FILES_BUCKET = "project-files";

export function surveyPhotoPath(orgId: string, leadId: string, surveyId: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${orgId}/leads/${leadId}/surveys/${surveyId}/photos/${Date.now()}-${safe}`;
}

export function ebBillDocumentPath(orgId: string, customerId: string, billId: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${orgId}/customers/${customerId}/eb-bills/${billId}/${Date.now()}-${safe}`;
}

export async function uploadProjectFile(path: string, file: File) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(PROJECT_FILES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  return { error };
}

export async function getSignedUrl(path: string, expiresInSeconds = 3600) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(PROJECT_FILES_BUCKET).createSignedUrl(path, expiresInSeconds);
  return { url: data?.signedUrl ?? null, error };
}

export async function deleteProjectFile(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(PROJECT_FILES_BUCKET).remove([path]);
  return { error };
}
