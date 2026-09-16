"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export function NewStudyButton({ leads }: { leads: { id: string; contact_name: string; company_name: string | null }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [saving, setSaving] = useState(false);

  async function start() {
    if (!leadId) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_or_create_engineering_study", { p_lead_id: leadId });
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not start study");
      return;
    }
    router.push(`/engineering/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Study
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start an engineering study</DialogTitle>
        </DialogHeader>
        <Select value={leadId} onValueChange={(v) => v && setLeadId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.company_name ?? l.contact_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={start} disabled={!leadId || saving}>
            {saving ? "Starting…" : "Start study"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
