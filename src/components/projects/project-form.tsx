"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { projectCreateSchema, type ProjectCreateValues } from "@/lib/validation/projects";
import { createClient } from "@/lib/supabase/client";

export function ProjectForm({
  customers,
  profiles,
}: {
  customers: { id: string; name: string }[];
  profiles: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState<{ id: string; label: string }[]>([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectCreateValues>({ resolver: zodResolver(projectCreateSchema) });

  const customerId = watch("customer_id");

  useEffect(() => {
    if (!customerId) {
      setSites([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("customer_sites")
      .select("id, label")
      .eq("customer_id", customerId)
      .then(({ data }) => setSites(data ?? []));
  }, [customerId]);

  async function onSubmit(values: ProjectCreateValues) {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_project", {
      p_customer_id: values.customer_id,
      p_lead_id: values.lead_id || null,
      p_site_id: values.site_id || null,
      p_pm_id: values.pm_id || null,
      p_capacity_kwp: values.capacity_kwp ? Number(values.capacity_kwp) : null,
      p_contract_value: values.contract_value ? Number(values.contract_value) : null,
      p_target_cod: values.target_cod || null,
    });
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create project");
      return;
    }
    toast.success(`Project ${data.project_number} created`);
    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="customer_id">Customer</Label>
        <Controller
          control={control}
          name="customer_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
              <SelectTrigger id="customer_id" className="w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.customer_id && <p className="text-sm text-destructive">{errors.customer_id.message}</p>}
      </div>

      {sites.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="site_id">Site</Label>
          <Controller
            control={control}
            name="site_id"
            render={({ field }) => (
              <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                <SelectTrigger id="site_id" className="w-full">
                  <SelectValue placeholder="No site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No site</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="pm_id">Project manager</Label>
        <Controller
          control={control}
          name="pm_id"
          render={({ field }) => (
            <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
              <SelectTrigger id="pm_id" className="w-full">
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

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="capacity_kwp">Capacity (kWp)</Label>
          <Input id="capacity_kwp" type="number" step="0.1" {...register("capacity_kwp")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contract_value">Contract value (₹)</Label>
          <Input id="contract_value" type="number" {...register("contract_value")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_cod">Target COD</Label>
          <Input id="target_cod" type="date" {...register("target_cod")} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
