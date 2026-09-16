"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS, type CustomerType } from "@/lib/customers/constants";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

type BillingAddress = { line1?: string; city?: string; state?: string; pincode?: string };

export function CustomerOverview({
  customer,
  contacts,
  sites,
  canManage,
}: {
  customer: Tables<"customers">;
  contacts: Tables<"customer_contacts">[];
  sites: Tables<"customer_sites">[];
  canManage: boolean;
}) {
  const router = useRouter();
  const address = (customer.billing_address as BillingAddress) ?? {};

  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(customer.name);
  const [type, setType] = useState<CustomerType>(customer.customer_type as CustomerType);
  const [gstin, setGstin] = useState(customer.gstin ?? "");
  const [line1, setLine1] = useState(address.line1 ?? "");
  const [city, setCity] = useState(address.city ?? "");
  const [state, setState] = useState(address.state ?? "");
  const [pincode, setPincode] = useState(address.pincode ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("customers")
      .update({
        name,
        customer_type: type,
        gstin: gstin || null,
        billing_address: { line1, city, state, pincode },
        notes: notes || null,
      })
      .eq("id", customer.id);
    setSavingProfile(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Customer updated");
    setEditingProfile(false);
    router.refresh();
  }

  async function removeContact(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("customer_contacts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  async function removeSite(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("customer_sites").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Company profile</h3>
            {canManage && !editingProfile && (
              <Button size="xs" variant="ghost" onClick={() => setEditingProfile(true)}>
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4 p-4">
            {editingProfile ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">Name</Label>
                  <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-type">Type</Label>
                    <Select value={type} onValueChange={(v) => v && setType(v as CustomerType)}>
                      <SelectTrigger id="c-type" className="w-full">
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
                    <Label htmlFor="c-gstin">GSTIN</Label>
                    <Input id="c-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-line1">Address line</Label>
                  <Input id="c-line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-city">City</Label>
                    <Input id="c-city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-state">State</Label>
                    <Input id="c-state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-pincode">PIN code</Label>
                    <Input id="c-pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-notes">Notes</Label>
                  <Textarea id="c-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="text-foreground">{CUSTOMER_TYPE_LABELS[customer.customer_type as CustomerType]}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">GSTIN</dt>
                  <dd className="text-foreground">{customer.gstin || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Billing address</dt>
                  <dd className="text-foreground">
                    {[address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                {customer.notes && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Notes</dt>
                    <dd className="whitespace-pre-wrap text-foreground">{customer.notes}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Contacts</h3>
            {canManage && (
              <Button size="xs" variant="ghost" onClick={() => setContactDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
          </div>
          <ul className="divide-y divide-border">
            {contacts.length === 0 && (
              <li className="px-4 py-4 text-center text-sm text-muted-foreground">No contacts yet</li>
            )}
            {contacts.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {c.is_primary && <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />}
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.designation, c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                {canManage && (
                  <Button size="icon-xs" variant="ghost" onClick={() => removeContact(c.id)} aria-label="Remove contact">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Sites</h3>
            {canManage && (
              <Button size="xs" variant="ghost" onClick={() => setSiteDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
          </div>
          <ul className="divide-y divide-border">
            {sites.length === 0 && (
              <li className="px-4 py-4 text-center text-sm text-muted-foreground">No sites yet</li>
            )}
            {sites.map((s) => {
              const a = (s.address as BillingAddress) ?? {};
              return (
                <li key={s.id} className="flex items-start justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[a.line1, a.city].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                  {canManage && (
                    <Button size="icon-xs" variant="ghost" onClick={() => removeSite(s.id)} aria-label="Remove site">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <AddContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        customerId={customer.id}
        onCreated={() => router.refresh()}
      />
      <AddSiteDialog
        open={siteDialogOpen}
        onOpenChange={setSiteDialogOpen}
        customerId={customer.id}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

function AddContactDialog({
  open,
  onOpenChange,
  customerId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("customer_contacts").insert({
      customer_id: customerId,
      name,
      designation: designation || null,
      phone: phone || null,
      email: email || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    setDesignation("");
    setPhone("");
    setEmail("");
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-designation">Designation</Label>
            <Input id="contact-designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Adding…" : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSiteDialog({
  open,
  onOpenChange,
  customerId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onCreated: () => void;
}) {
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("customer_sites").insert({
      customer_id: customerId,
      label,
      address: { line1: line1 || undefined, city: city || undefined },
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLabel("");
    setLine1("");
    setCity("");
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add site</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="site-label">Label</Label>
            <Input id="site-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Factory Roof" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-line1">Address line</Label>
            <Input id="site-line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-city">City</Label>
            <Input id="site-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving || !label.trim()}>
            {saving ? "Adding…" : "Add site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
