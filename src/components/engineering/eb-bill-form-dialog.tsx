"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ebBillFormSchema, type EbBillFormValues } from "@/lib/validation/eb-bills";
import { createClient } from "@/lib/supabase/client";
import { ebBillDocumentPath } from "@/lib/storage/project-files";

export function EbBillFormDialog({
  open,
  onOpenChange,
  customers,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EbBillFormValues>({
    resolver: zodResolver(ebBillFormSchema),
    defaultValues: { paid_status: "unpaid" },
  });

  async function onSubmit(values: EbBillFormValues) {
    setSaving(true);
    const supabase = createClient();

    const { data: bill, error } = await supabase
      .from("eb_bills")
      .insert({
        customer_id: values.customer_id,
        billing_month: `${values.billing_month}-01`,
        bill_number: values.bill_number || null,
        opening_reading: values.opening_reading ? Number(values.opening_reading) : null,
        closing_reading: values.closing_reading ? Number(values.closing_reading) : null,
        units_consumed: Number(values.units_consumed),
        demand_kva: values.demand_kva ? Number(values.demand_kva) : null,
        tariff_category: values.tariff_category || null,
        amount: values.amount ? Number(values.amount) : null,
        due_date: values.due_date || null,
        paid_status: values.paid_status,
      })
      .select()
      .single();

    if (error || !bill) {
      setSaving(false);
      toast.error(error?.message ?? "Could not save bill — check the billing month isn't already recorded for this customer");
      return;
    }

    if (file) {
      const path = ebBillDocumentPath(bill.organization_id, bill.customer_id, bill.id, file.name);
      const { error: uploadError } = await supabase.storage.from("project-files").upload(path, file);
      if (!uploadError) {
        await supabase.from("eb_bills").update({ source_document_path: path }).eq("id", bill.id);
      }
    }

    setSaving(false);
    toast.success("Bill recorded");
    reset();
    setFile(null);
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add EB bill</DialogTitle>
          <DialogDescription>
            Enter values manually — automatic extraction from a scanned bill isn&apos;t connected yet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_id">Customer</Label>
              <Controller
                control={control}
                name="customer_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <SelectTrigger id="customer_id" className="w-full">
                      <SelectValue placeholder="Select" />
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
            <div className="space-y-1.5">
              <Label htmlFor="billing_month">Billing month</Label>
              <Input id="billing_month" type="month" {...register("billing_month")} />
              {errors.billing_month && <p className="text-sm text-destructive">{errors.billing_month.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="opening_reading">Opening reading</Label>
              <Input id="opening_reading" type="number" {...register("opening_reading")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closing_reading">Closing reading</Label>
              <Input id="closing_reading" type="number" {...register("closing_reading")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="units_consumed">Units consumed *</Label>
              <Input id="units_consumed" type="number" {...register("units_consumed")} />
              {errors.units_consumed && <p className="text-sm text-destructive">{errors.units_consumed.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="demand_kva">Demand (kVA)</Label>
              <Input id="demand_kva" type="number" {...register("demand_kva")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tariff_category">Tariff category</Label>
              <Input id="tariff_category" {...register("tariff_category")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" {...register("amount")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paid_status">Status</Label>
              <Controller
                control={control}
                name="paid_status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <SelectTrigger id="paid_status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partially Paid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source_document">Source document (optional)</Label>
            <Input id="source_document" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
