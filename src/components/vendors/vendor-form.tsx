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
import { vendorFormSchema, type VendorFormValues } from "@/lib/validation/vendors";
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/vendors/constants";
import { createClient } from "@/lib/supabase/client";

export function VendorForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: { category: "other" },
  });

  const category = watch("category");

  async function onSubmit(values: VendorFormValues) {
    setSaving(true);
    const supabase = createClient();

    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert({
        name: values.name,
        category: values.category,
        gstin: values.gstin || null,
        payment_terms: values.payment_terms || null,
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

    if (error || !vendor) {
      setSaving(false);
      toast.error(error?.message ?? "Could not create vendor");
      return;
    }

    if (values.contact_name) {
      await supabase.from("vendor_contacts").insert({
        vendor_id: vendor.id,
        name: values.contact_name,
        phone: values.contact_phone || null,
        email: values.contact_email || null,
        is_primary: true,
      });
    }

    toast.success("Vendor created");
    router.push(`/vendors/${vendor.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Company</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Everblue Solar Modules Pvt Ltd" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => v && setValue("category", v as VendorCategory)}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {VENDOR_CATEGORY_LABELS[c]}
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
        <div className="space-y-1.5">
          <Label htmlFor="payment_terms">Standard payment terms</Label>
          <Input id="payment_terms" {...register("payment_terms")} placeholder="50% advance, 50% on delivery" />
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
        <Textarea {...register("notes")} rows={3} placeholder="Anything else worth knowing about this vendor" />
      </section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create vendor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
