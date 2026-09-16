"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { rfqFormSchema, type RfqFormValues } from "@/lib/validation/procurement";
import { VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/vendors/constants";
import { createClient } from "@/lib/supabase/client";

type Source = { id: string; label: string; bomHeaderId: string };
type Vendor = { id: string; name: string; category: string; status: string };

export function RfqForm({ sources, vendors }: { sources: Source[]; vendors: Vendor[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: { vendor_ids: [] },
  });

  const vendorIds = watch("vendor_ids");

  async function onSubmit(values: RfqFormValues) {
    const source = sources.find((s) => s.id === values.source_id);
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_rfq", {
      p_title: values.title,
      p_project_id: source?.id ?? null,
      p_bom_header_id: source?.bomHeaderId ?? null,
      p_due_date: values.due_date || null,
      p_notes: values.notes || null,
      p_vendor_ids: values.vendor_ids,
    });
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create RFQ");
      return;
    }
    toast.success(`RFQ ${data.rfq_number} created`);
    router.push(`/procurement/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Modules & inverters — SOL-2026-0002" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source_id">Source project (BOM)</Label>
        <Controller
          control={control}
          name="source_id"
          render={({ field }) => (
            <Select
              items={sources.map((s) => ({ value: s.id, label: s.label }))}
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
            >
              <SelectTrigger id="source_id" className="w-full">
                <SelectValue placeholder="Select a project with a finalized BOM" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.source_id && <p className="text-sm text-destructive">{errors.source_id.message}</p>}
        {sources.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No projects have a linked BOM yet — an RFQ needs one to pull its equipment list from.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="due_date">Quotes due by</Label>
        <Input id="due_date" type="date" {...register("due_date")} />
      </div>

      <div className="space-y-1.5">
        <Label>Invite vendors</Label>
        <Controller
          control={control}
          name="vendor_ids"
          render={({ field }) => (
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
              {vendors.length === 0 && (
                <p className="px-4 py-4 text-center text-sm text-muted-foreground">
                  No active vendors yet — add one first.
                </p>
              )}
              <ul className="divide-y divide-border">
                {vendors.map((v) => {
                  const checked = field.value.includes(v.id);
                  return (
                    <li key={v.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 hover:bg-accent">
                        <span className="flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              field.onChange(
                                e.target.checked ? [...field.value, v.id] : field.value.filter((id) => id !== v.id),
                              )
                            }
                            className="h-3.5 w-3.5 rounded border-border"
                          />
                          {v.name}
                        </span>
                        <Badge variant="secondary">{VENDOR_CATEGORY_LABELS[v.category as VendorCategory] ?? v.category}</Badge>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        />
        {errors.vendor_ids && <p className="text-sm text-destructive">{errors.vendor_ids.message}</p>}
        {vendorIds.length > 0 && <p className="text-xs text-muted-foreground">{vendorIds.length} vendor{vendorIds.length === 1 ? "" : "s"} selected</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} placeholder="Delivery site access, packaging requirements, etc." />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving || sources.length === 0 || vendors.length === 0}>
          {saving ? "Creating…" : "Create RFQ"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
