"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { customerFormSchema, type CustomerFormValues } from "@/lib/validation/customers";
import { CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS, type CustomerType } from "@/lib/customers/constants";
import { createClient } from "@/lib/supabase/client";

export function CustomerForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { customer_type: "residential" },
  });

  const customerType = watch("customer_type");

  async function onSubmit(values: CustomerFormValues) {
    setSaving(true);
    const supabase = createClient();

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        name: values.name,
        customer_type: values.customer_type,
        gstin: values.gstin || null,
        billing_address: {
          line1: values.line1 || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          pincode: values.pincode || undefined,
        },
        notes: values.notes || null,
      })
      .select()
      .single();

    if (error || !customer) {
      setSaving(false);
      toast.error(error?.message ?? "Could not create customer");
      return;
    }

    if (values.contact_name) {
      await supabase.from("customer_contacts").insert({
        customer_id: customer.id,
        name: values.contact_name,
        phone: values.contact_phone || null,
        email: values.contact_email || null,
        is_primary: true,
      });
    }

    toast.success("Customer created");
    router.push(`/customers/${customer.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Company</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="ABC Industries Pvt Ltd" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="customer_type">Customer type</Label>
            <Select value={customerType} onValueChange={(v) => v && setValue("customer_type", v as CustomerType)}>
              <SelectTrigger id="customer_type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CUSTOMER_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" {...register("gstin")} placeholder="29ABCDE1234F1Z5" className="uppercase" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Billing address</h2>
        <div className="space-y-1.5">
          <Label htmlFor="line1">Address line</Label>
          <Input id="line1" {...register("line1")} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode">PIN code</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Primary contact (optional)</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Name</Label>
            <Input id="contact_name" {...register("contact_name")} />
          </div>
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
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Notes</h2>
        <Textarea {...register("notes")} rows={3} placeholder="Anything else worth knowing about this customer" />
      </section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create customer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
