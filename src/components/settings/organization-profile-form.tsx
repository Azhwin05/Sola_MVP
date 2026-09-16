"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

type BillingAddress = {
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export function OrganizationProfileForm({ organization }: { organization: Tables<"organizations"> }) {
  const router = useRouter();
  const address = (organization.billing_address as BillingAddress) ?? {};
  const [name, setName] = useState(organization.name);
  const [gstin, setGstin] = useState(organization.gstin ?? "");
  const [line1, setLine1] = useState(address.line1 ?? "");
  const [city, setCity] = useState(address.city ?? "");
  const [state, setState] = useState(address.state ?? "");
  const [pincode, setPincode] = useState(address.pincode ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        name,
        gstin: gstin || null,
        billing_address: { line1, city, state, pincode },
      })
      .eq("id", organization.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Organization profile saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="org-name">Company name</Label>
        <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="line1">Billing address</Label>
        <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Address line" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pincode">PIN code</Label>
          <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
