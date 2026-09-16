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
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { proposalFormSchema, type ProposalFormValues } from "@/lib/validation/proposals";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";
import type { LeadWithCustomer, RevisionWithBoms } from "@/components/proposals/types";
import type { CapacityOutputs } from "@/lib/engineering/capacity";

export function ProposalEditor({
  lead,
  revisions,
  existingVersion,
  onSaved,
}: {
  lead: LeadWithCustomer;
  revisions: RevisionWithBoms[];
  existingVersion: Tables<"proposal_versions"> | null;
  onSaved: (version: Tables<"proposal_versions">) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [revisionId, setRevisionId] = useState(existingVersion?.engineering_revision_id ?? revisions[0]?.id ?? "");

  const selectedRevision = revisions.find((r) => r.id === revisionId);
  const latestBom = selectedRevision ? [...selectedRevision.boms].sort((a, b) => b.version - a.version)[0] : undefined;
  const bomTotal = latestBom?.items.reduce((sum, i) => sum + (i.estimated_amount ?? 0), 0) ?? 0;
  const outputs = selectedRevision?.outputs as CapacityOutputs | undefined;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: existingVersion
      ? {
          equipment_cost: existingVersion.equipment_cost.toString(),
          installation_cost: existingVersion.installation_cost.toString(),
          other_cost: existingVersion.other_cost.toString(),
          discount: existingVersion.discount.toString(),
          tax_rate_percent: existingVersion.tax_rate_percent.toString(),
          is_interstate: existingVersion.is_interstate,
          payment_terms: existingVersion.payment_terms ?? "40% advance, 40% on material delivery, 20% on commissioning",
          warranty_equipment_years: existingVersion.warranty_equipment_years?.toString() ?? "25",
          warranty_workmanship_years: existingVersion.warranty_workmanship_years?.toString() ?? "5",
          scope: existingVersion.scope ?? "",
          exclusions: existingVersion.exclusions ?? "",
          assumptions: existingVersion.assumptions ?? "",
          change_summary: "",
        }
      : {
          equipment_cost: bomTotal ? bomTotal.toFixed(0) : "",
          installation_cost: "",
          other_cost: "",
          discount: "",
          tax_rate_percent: "18",
          is_interstate: false,
          payment_terms: "40% advance, 40% on material delivery, 20% on commissioning",
          warranty_equipment_years: "25",
          warranty_workmanship_years: "5",
          scope: "Design, supply, installation and commissioning of the rooftop solar system as specified.",
          exclusions: "Civil work beyond standard mounting, shadow-free guarantee, DISCOM approval delays.",
          assumptions: outputs?.assumptions.join(" "),
        },
  });

  async function onSubmit(values: ProposalFormValues) {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      equipment_cost: Number(values.equipment_cost) || 0,
      installation_cost: Number(values.installation_cost) || 0,
      other_cost: Number(values.other_cost) || 0,
      discount: Number(values.discount) || 0,
      tax_rate_percent: Number(values.tax_rate_percent) || 0,
      is_interstate: values.is_interstate,
      payment_terms: values.payment_terms || null,
      warranty_equipment_years: values.warranty_equipment_years ? Number(values.warranty_equipment_years) : null,
      warranty_workmanship_years: values.warranty_workmanship_years ? Number(values.warranty_workmanship_years) : null,
      scope: values.scope || null,
      exclusions: values.exclusions || null,
      assumptions: values.assumptions || null,
    };

    if (existingVersion) {
      const { data, error } = await supabase
        .from("proposal_versions")
        .update({ ...payload, engineering_revision_id: revisionId || null, bom_header_id: latestBom?.id ?? null })
        .eq("id", existingVersion.id)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error(error?.message ?? "Could not save proposal");
        return;
      }
      toast.success("Draft saved");
      onSaved(data);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.rpc("create_proposal_version", {
      p_lead_id: lead.id,
      p_engineering_revision_id: revisionId || null,
      p_bom_header_id: latestBom?.id ?? null,
      p_equipment_cost: payload.equipment_cost,
      p_installation_cost: payload.installation_cost,
      p_other_cost: payload.other_cost,
      p_discount: payload.discount,
      p_tax_rate_percent: payload.tax_rate_percent,
      p_is_interstate: payload.is_interstate,
      p_payment_terms: payload.payment_terms,
      p_warranty_equipment_years: payload.warranty_equipment_years,
      p_warranty_workmanship_years: payload.warranty_workmanship_years,
      p_scope: payload.scope,
      p_exclusions: payload.exclusions,
      p_assumptions: payload.assumptions,
      p_change_summary: values.change_summary || null,
    });
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create proposal");
      return;
    }
    toast.success(`Proposal ${data.proposal_number} v${data.version} created`);
    onSaved(data);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {revisions.length > 1 && (
        <div className="space-y-1.5">
          <Label>Based on engineering revision</Label>
          <Select value={revisionId} onValueChange={(v) => v && setRevisionId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {revisions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  Revision {r.revision_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {outputs && (
        <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {outputs.actualKwp.toFixed(1)} kWp · {outputs.panelQty} panels
          {bomTotal > 0 && ` · BOM total ₹${bomTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        </p>
      )}

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Commercial</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="equipment_cost">Equipment (₹)</Label>
            <Input id="equipment_cost" type="number" {...register("equipment_cost")} />
            {errors.equipment_cost && <p className="text-sm text-destructive">{errors.equipment_cost.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="installation_cost">Installation (₹)</Label>
            <Input id="installation_cost" type="number" {...register("installation_cost")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="other_cost">Other (₹)</Label>
            <Input id="other_cost" type="number" {...register("other_cost")} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="discount">Discount (₹)</Label>
            <Input id="discount" type="number" {...register("discount")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax_rate_percent">GST rate (%)</Label>
            <Input id="tax_rate_percent" type="number" step="0.5" {...register("tax_rate_percent")} />
          </div>
          <div className="flex items-end gap-2 pb-1.5">
            <Controller
              control={control}
              name="is_interstate"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} id="is_interstate" />}
            />
            <Label htmlFor="is_interstate">Inter-state (IGST)</Label>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Terms</h3>
        <div className="space-y-1.5">
          <Label htmlFor="payment_terms">Payment terms</Label>
          <Input id="payment_terms" {...register("payment_terms")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="warranty_equipment_years">Equipment warranty (years)</Label>
            <Input id="warranty_equipment_years" type="number" {...register("warranty_equipment_years")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="warranty_workmanship_years">Workmanship warranty (years)</Label>
            <Input id="warranty_workmanship_years" type="number" {...register("warranty_workmanship_years")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scope">Scope</Label>
          <Textarea id="scope" rows={2} {...register("scope")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exclusions">Exclusions</Label>
          <Textarea id="exclusions" rows={2} {...register("exclusions")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assumptions">Assumptions</Label>
          <Textarea id="assumptions" rows={2} {...register("assumptions")} />
        </div>
      </section>

      {existingVersion && (
        <div className="space-y-1.5">
          <Label htmlFor="change_summary">What changed in this version? (optional)</Label>
          <Input id="change_summary" {...register("change_summary")} />
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : existingVersion ? "Save draft" : "Create proposal"}
      </Button>
    </form>
  );
}
