"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_PRIORITY_LABELS,
  type LeadStage,
  type LeadPriority,
} from "@/lib/leads/constants";
import { createClient } from "@/lib/supabase/client";
import type { LeadRow } from "@/components/leads/types";
import { cn } from "@/lib/utils";

export function LeadsKanban({ leads, canManage }: { leads: LeadRow[]; canManage: boolean }) {
  const router = useRouter();

  async function moveStage(leadId: string, stage: LeadStage) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ stage }).eq("id", leadId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      activity_type: "stage_change",
      description: `Stage changed to ${LEAD_STAGE_LABELS[stage]}`,
    });
    router.refresh();
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage);
        return (
          <div key={stage} className="w-64 shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-foreground">{LEAD_STAGE_LABELS[stage]}</h3>
              <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/40 p-2 min-h-24">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="cursor-pointer rounded-md border border-border bg-card p-2.5 shadow-sm hover:border-foreground/20"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <p className="text-sm font-medium text-foreground">{lead.contact_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.company_name || lead.lead_number}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <Badge variant={lead.priority === "high" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                      {LEAD_PRIORITY_LABELS[lead.priority as LeadPriority] ?? lead.priority}
                    </Badge>
                    {lead.estimated_value && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        ₹{(lead.estimated_value / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-2">
                      <Select
                        items={LEAD_STAGES.map((s) => ({ value: s, label: LEAD_STAGE_LABELS[s] }))}
                        value={lead.stage}
                        onValueChange={(v) => v && moveStage(lead.id, v as LeadStage)}
                      >
                        <SelectTrigger size="sm" className={cn("w-full text-xs")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {LEAD_STAGE_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
