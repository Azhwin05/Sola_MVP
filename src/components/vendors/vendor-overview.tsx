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
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/vendors/constants";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";

type BillingAddress = { line1?: string; city?: string; state?: string; pincode?: string };

export function VendorOverview({
  vendor,
  contacts,
  canManage,
}: {
  vendor: Tables<"vendors">;
  contacts: Tables<"vendor_contacts">[];
  canManage: boolean;
}) {
  const router = useRouter();
  const address = (vendor.billing_address as BillingAddress) ?? {};

  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(vendor.name);
  const [category, setCategory] = useState<VendorCategory>(vendor.category as VendorCategory);
  const [gstin, setGstin] = useState(vendor.gstin ?? "");
  const [paymentTerms, setPaymentTerms] = useState(vendor.payment_terms ?? "");
  const [line1, setLine1] = useState(address.line1 ?? "");
  const [city, setCity] = useState(address.city ?? "");
  const [state, setState] = useState(address.state ?? "");
  const [pincode, setPincode] = useState(address.pincode ?? "");
  const [notes, setNotes] = useState(vendor.notes ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("vendors")
      .update({
        name,
        category,
        gstin: gstin || null,
        payment_terms: paymentTerms || null,
        billing_address: { line1, city, state, pincode },
        notes: notes || null,
      })
      .eq("id", vendor.id);
    setSavingProfile(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vendor updated");
    setEditingProfile(false);
    router.refresh();
  }

  async function toggleStatus() {
    const supabase = createClient();
    const nextStatus = vendor.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("vendors").update({ status: nextStatus }).eq("id", vendor.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  async function removeContact(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("vendor_contacts").delete().eq("id", id);
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
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={toggleStatus}>
                  Mark {vendor.status === "active" ? "inactive" : "active"}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setEditingProfile(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4 p-4">
            {editingProfile ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="v-name">Name</Label>
                  <Input id="v-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="v-category">Category</Label>
                    <Select value={category} onValueChange={(v) => v && setCategory(v as VendorCategory)}>
                      <SelectTrigger id="v-category" className="w-full">
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
                    <Label htmlFor="v-gstin">GSTIN</Label>
                    <Input id="v-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-terms">Payment terms</Label>
                  <Input id="v-terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-line1">Address line</Label>
                  <Input id="v-line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="v-city">City</Label>
                    <Input id="v-city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="v-state">State</Label>
                    <Input id="v-state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="v-pincode">PIN code</Label>
                    <Input id="v-pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-notes">Notes</Label>
                  <Textarea id="v-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-foreground">{VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory]}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">GSTIN</dt>
                  <dd className="text-foreground">{vendor.gstin || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Payment terms</dt>
                  <dd className="text-foreground">{vendor.payment_terms || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Billing address</dt>
                  <dd className="text-foreground">
                    {[address.line1, address.city, address.state, address.pincode].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                {vendor.notes && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Notes</dt>
                    <dd className="whitespace-pre-wrap text-foreground">{vendor.notes}</dd>
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
      </div>

      <AddContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        vendorId={vendor.id}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

function AddContactDialog({
  open,
  onOpenChange,
  vendorId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
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
    const { error } = await supabase.from("vendor_contacts").insert({
      vendor_id: vendorId,
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
