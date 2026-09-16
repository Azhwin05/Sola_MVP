"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const ENTITY_LABELS: Record<string, string> = {
  lead: "Lead",
  survey: "Site Survey",
  project: "Project",
  proposal: "Proposal",
  purchase_order: "Purchase Order",
  invoice: "Invoice",
  grn: "Goods Receipt",
  service_ticket: "Service Ticket",
};

export function NumberingFormatsForm({
  formats,
  organizationId,
}: {
  formats: Record<string, string>;
  organizationId: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(formats);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("system_settings")
      .update({ numbering_formats: values })
      .eq("organization_id", organizationId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Numbering formats saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{YYYY}"}</code> for the year and{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{SEQ:4}"}</code> for a zero-padded sequence.
      </p>
      {Object.entries(ENTITY_LABELS).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={values[key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          />
        </div>
      ))}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save formats"}
      </Button>
    </form>
  );
}
