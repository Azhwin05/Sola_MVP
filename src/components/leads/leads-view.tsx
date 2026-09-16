"use client";

import { useMemo, useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList } from "lucide-react";
import { LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_PRIORITIES, LEAD_PRIORITY_LABELS, type LeadStage, type LeadPriority } from "@/lib/leads/constants";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsKanban } from "@/components/leads/leads-kanban";
import type { LeadRow } from "@/components/leads/types";
import { cn } from "@/lib/utils";

export function LeadsView({
  leads,
  profiles,
  canManage,
}: {
  leads: LeadRow[];
  profiles: { id: string; full_name: string }[];
  canManage: boolean;
}) {
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
      if (priorityFilter !== "all" && lead.priority !== priorityFilter) return false;
      if (ownerFilter !== "all" && lead.owner_id !== ownerFilter) return false;
      if (!q) return true;
      return (
        lead.contact_name.toLowerCase().includes(q) ||
        (lead.company_name ?? "").toLowerCase().includes(q) ||
        lead.lead_number.toLowerCase().includes(q)
      );
    });
  }, [leads, query, stageFilter, priorityFilter, ownerFilter]);

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No leads yet"
        description="Create your first lead to start tracking the pipeline from first contact through to won or lost."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search leads…" className="w-56" />

        <Select value={stageFilter} onValueChange={(v) => v && setStageFilter(v as LeadStage | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {LEAD_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {LEAD_STAGE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => v && setPriorityFilter(v as LeadPriority | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {LEAD_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {LEAD_PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={(v) => v && setOwnerFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-0.5 rounded-md border border-border p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
              view === "kanban" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Kanban view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
              view === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No leads match these filters" description="Try clearing a filter or search term." />
      ) : view === "kanban" ? (
        <LeadsKanban leads={filtered} canManage={canManage} />
      ) : (
        <LeadsTable leads={filtered} />
      )}
    </div>
  );
}
