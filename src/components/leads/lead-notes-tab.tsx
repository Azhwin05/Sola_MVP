"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export function LeadNotesTab({
  leadId,
  notes,
  canManage,
}: {
  leadId: string;
  notes: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = value !== (notes ?? "");

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ notes: value || null }).eq("id", leadId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notes saved");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        placeholder="Freeform notes about this lead…"
        disabled={!canManage}
      />
      {canManage && dirty && (
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save notes"}
        </Button>
      )}
    </div>
  );
}
