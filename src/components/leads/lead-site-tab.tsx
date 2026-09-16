"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { LeadDetail } from "@/components/leads/types";

export function LeadSiteTab({
  lead,
  sites,
  canManage,
}: {
  lead: LeadDetail;
  sites: { id: string; label: string }[];
  canManage: boolean;
}) {
  const router = useRouter();

  async function selectSite(siteId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ site_id: siteId }).eq("id", lead.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  if (!lead.customer_id) {
    return (
      <EmptyState
        icon={MapPin}
        title="Link a customer to add a site"
        description="Sites belong to a customer record. Convert this lead to a customer first, then add a site from the customer's Overview tab."
      />
    );
  }

  if (sites.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No sites on this customer yet"
        description={`Add a site from ${lead.customer!.name}'s customer page, then come back here to link it to this lead.`}
      />
    );
  }

  return (
    <div className="max-w-md space-y-2">
      {sites.map((site) => (
        <button
          key={site.id}
          disabled={!canManage}
          onClick={() => selectSite(site.id)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
            lead.site_id === site.id
              ? "border-info bg-info/5 text-foreground"
              : "border-border text-foreground hover:bg-accent disabled:hover:bg-transparent",
          )}
        >
          {site.label}
          {lead.site_id === site.id && <span className="text-xs text-info">Selected</span>}
        </button>
      ))}
    </div>
  );
}
