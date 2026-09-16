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
import { leadFormSchema, type LeadFormValues } from "@/lib/validation/leads";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, LEAD_PRIORITIES, LEAD_PRIORITY_LABELS } from "@/lib/leads/constants";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; name?: string; full_name?: string };

export function LeadForm({
  sources,
  profiles,
  customers,
  defaultOwnerId,
}: {
  sources: Option[];
  profiles: Option[];
  customers: Option[];
  defaultOwnerId: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      project_type: "residential",
      priority: "medium",
      owner_id: defaultOwnerId,
    },
  });

  async function onSubmit(values: LeadFormValues) {
    setSaving(true);
    const supabase = createClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        contact_name: values.contact_name,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        company_name: values.company_name || null,
        customer_id: values.customer_id || null,
        source_id: values.source_id || null,
        project_type: values.project_type,
        estimated_capacity_kwp: values.estimated_capacity_kwp ? Number(values.estimated_capacity_kwp) : null,
        estimated_value: values.estimated_value ? Number(values.estimated_value) : null,
        owner_id: values.owner_id || null,
        priority: values.priority,
        next_action: values.next_action || null,
        next_action_date: values.next_action_date || null,
        expected_close_date: values.expected_close_date || null,
        notes: values.notes || null,
      })
      .select()
      .single();

    if (error || !lead) {
      setSaving(false);
      toast.error(error?.message ?? "Could not create lead");
      return;
    }

    toast.success(`Lead ${lead.lead_number} created`);
    router.push(`/leads/${lead.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Contact & company</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Contact name</Label>
            <Input id="contact_name" {...register("contact_name")} />
            {errors.contact_name && <p className="text-sm text-destructive">{errors.contact_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company (optional)</Label>
            <Input id="company_name" {...register("company_name")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact_phone">Phone</Label>
            <Input id="contact_phone" {...register("contact_phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">Email</Label>
            <Input id="contact_email" type="email" {...register("contact_email")} />
            {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email.message}</p>}
          </div>
        </div>
        {customers.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="customer_id">Link to existing customer (optional)</Label>
            <Controller
              control={control}
              name="customer_id"
              render={({ field }) => (
                <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                  <SelectTrigger id="customer_id" className="w-full">
                    <SelectValue placeholder="Not linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not linked</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Classification</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="project_type">Project type</Label>
            <Controller
              control={control}
              name="project_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                  <SelectTrigger id="project_type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {PROJECT_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source_id">Source</Label>
            <Controller
              control={control}
              name="source_id"
              render={({ field }) => (
                <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                  <SelectTrigger id="source_id" className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unspecified</SelectItem>
                    {sources.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {LEAD_PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Commercial</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="estimated_capacity_kwp">Est. capacity (kWp)</Label>
            <Input id="estimated_capacity_kwp" type="number" step="0.1" {...register("estimated_capacity_kwp")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estimated_value">Est. value (₹)</Label>
            <Input id="estimated_value" type="number" step="1000" {...register("estimated_value")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expected_close_date">Expected close</Label>
            <Input id="expected_close_date" type="date" {...register("expected_close_date")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Ownership & next action</h2>
        <div className="space-y-1.5">
          <Label htmlFor="owner_id">Owner</Label>
          <Controller
            control={control}
            name="owner_id"
            render={({ field }) => (
              <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                <SelectTrigger id="owner_id" className="w-full">
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="next_action">Next action</Label>
            <Input id="next_action" {...register("next_action")} placeholder="Call to schedule survey" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next_action_date">Next action date</Label>
            <Input id="next_action_date" type="date" {...register("next_action_date")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Notes</h2>
        <Textarea {...register("notes")} rows={3} />
      </section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create lead"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
