"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { surveyCreateSchema, type SurveyCreateValues } from "@/lib/validation/surveys";
import { createClient } from "@/lib/supabase/client";

type Lead = {
  id: string;
  contact_name: string;
  company_name: string | null;
  customer_id: string | null;
  customer: { id: string; name: string } | null;
};

type Site = { id: string; label: string };

export function SurveyCreateForm({
  leads,
  profiles,
  defaultLeadId,
}: {
  leads: Lead[];
  profiles: { id: string; full_name: string }[];
  defaultLeadId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [addingSite, setAddingSite] = useState(false);
  const [newSiteLabel, setNewSiteLabel] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyCreateValues>({
    resolver: zodResolver(surveyCreateSchema),
    defaultValues: {
      lead_id: defaultLeadId ?? "",
      survey_date: new Date().toISOString().slice(0, 10),
    },
  });

  const leadId = watch("lead_id");
  const selectedLead = leads.find((l) => l.id === leadId);

  useEffect(() => {
    if (!selectedLead?.customer_id) {
      setSites([]);
      return;
    }
    setLoadingSites(true);
    const supabase = createClient();
    supabase
      .from("customer_sites")
      .select("id, label")
      .eq("customer_id", selectedLead.customer_id)
      .order("created_at")
      .then(({ data }) => {
        setSites(data ?? []);
        setLoadingSites(false);
      });
  }, [selectedLead?.customer_id]);

  async function addSite() {
    if (!newSiteLabel.trim() || !selectedLead?.customer_id) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customer_sites")
      .insert({ customer_id: selectedLead.customer_id, label: newSiteLabel.trim() })
      .select("id, label")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Could not add site");
      return;
    }
    setSites((s) => [...s, data]);
    setValue("site_id", data.id);
    setNewSiteLabel("");
    setAddingSite(false);
  }

  async function onSubmit(values: SurveyCreateValues) {
    if (!selectedLead?.customer_id) return;
    setSaving(true);
    const supabase = createClient();
    const { data: survey, error } = await supabase
      .from("site_surveys")
      .insert({
        lead_id: values.lead_id,
        customer_id: selectedLead.customer_id,
        site_id: values.site_id,
        engineer_id: values.engineer_id || null,
        survey_date: values.survey_date,
        roof_type: values.roof_type || null,
      })
      .select()
      .single();

    if (error || !survey) {
      setSaving(false);
      toast.error(error?.message ?? "Could not create survey");
      return;
    }

    toast.success(`Survey ${survey.survey_number} created`);
    router.push(`/surveys/${survey.id}`);
    router.refresh();
  }

  if (leads.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No leads are linked to a customer yet. Open a lead and use &quot;Convert to Customer&quot; before scheduling a
        survey.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="lead_id">Lead</Label>
        <Controller
          control={control}
          name="lead_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
              <SelectTrigger id="lead_id" className="w-full">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.customer?.name ?? l.company_name ?? l.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.lead_id && <p className="text-sm text-destructive">{errors.lead_id.message}</p>}
      </div>

      {selectedLead && (
        <div className="space-y-1.5">
          <Label htmlFor="site_id">Site</Label>
          {loadingSites ? (
            <p className="text-sm text-muted-foreground">Loading sites…</p>
          ) : sites.length === 0 && !addingSite ? (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">No sites on this customer yet.</p>
              <Button type="button" size="xs" variant="outline" onClick={() => setAddingSite(true)}>
                <Plus className="h-3 w-3" />
                Add site
              </Button>
            </div>
          ) : addingSite ? (
            <div className="flex items-center gap-2">
              <Input
                value={newSiteLabel}
                onChange={(e) => setNewSiteLabel(e.target.value)}
                placeholder="Factory Roof"
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={addSite} disabled={!newSiteLabel.trim()}>
                Add
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAddingSite(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Controller
              control={control}
              name="site_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                  <SelectTrigger id="site_id" className="w-full">
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.site_id && <p className="text-sm text-destructive">{errors.site_id.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="survey_date">Survey date</Label>
          <Input id="survey_date" type="date" {...register("survey_date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="engineer_id">Engineer</Label>
          <Controller
            control={control}
            name="engineer_id"
            render={({ field }) => (
              <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                <SelectTrigger id="engineer_id" className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="roof_type">Roof / site type</Label>
        <Input id="roof_type" {...register("roof_type")} placeholder="RCC flat roof, tin shed, ground mount…" />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving || !selectedLead?.customer_id}>
          {saving ? "Creating…" : "Create survey"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
