"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_FILES_BUCKET, surveyPhotoPath } from "@/lib/storage/project-files";
import type { Tables } from "@/lib/types/database";

type Category = { id: string; name: string; is_mandatory: boolean };
type Photo = Tables<"survey_photos"> & { category: { id: string; name: string } | null };

export function SurveyPhotos({
  surveyId,
  leadId,
  organizationId,
  photos,
  categories,
  canManage,
}: {
  surveyId: string;
  leadId: string;
  organizationId: string;
  photos: Photo[];
  categories: Category[];
  canManage: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (photos.length === 0) return;
    const supabase = createClient();
    supabase.storage
      .from(PROJECT_FILES_BUCKET)
      .createSignedUrls(
        photos.map((p) => p.storage_path),
        3600,
      )
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach((d) => {
          if (d.signedUrl && d.path) map[d.path] = d.signedUrl;
        });
        setSignedUrls(map);
      });
  }, [photos]);

  const coveredCategoryIds = new Set(photos.map((p) => p.category?.id).filter(Boolean));
  const missingMandatory = categories.filter((c) => c.is_mandatory && !coveredCategoryIds.has(c.id));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !categoryId) return;
    setUploading(true);
    const path = surveyPhotoPath(organizationId, leadId, surveyId, file.name);
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from(PROJECT_FILES_BUCKET).upload(path, file);
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message);
      return;
    }
    const { error: insertError } = await supabase.from("survey_photos").insert({
      survey_id: surveyId,
      category_id: categoryId,
      storage_path: path,
    });
    setUploading(false);
    if (insertError) {
      toast.error(insertError.message);
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function removePhoto(photo: Photo) {
    const supabase = createClient();
    await supabase.storage.from(PROJECT_FILES_BUCKET).remove([photo.storage_path]);
    const { error } = await supabase.from("survey_photos").delete().eq("id", photo.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Photos</h3>
        {missingMandatory.length > 0 && (
          <span className="text-xs text-warning">
            Missing required: {missingMandatory.map((c) => c.name).join(", ")}
          </span>
        )}
      </div>

      {canManage && (
        <div className="mb-4 flex items-center gap-2">
          <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.is_mandatory ? " *" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload" />
          <Button type="button" size="sm" variant="outline" disabled={uploading || !categoryId} onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload photo"}
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-border">
              {signedUrls[photo.storage_path] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signedUrls[photo.storage_path]}
                  alt={photo.category?.name ?? "Survey photo"}
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-muted">
                  <ImageOff className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center justify-between gap-1 p-1.5">
                <Badge variant="secondary" className="truncate text-[10px]">
                  {photo.category?.name ?? "Uncategorized"}
                </Badge>
                {canManage && (
                  <Button size="icon-xs" variant="ghost" onClick={() => removePhoto(photo)} aria-label="Delete photo">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
