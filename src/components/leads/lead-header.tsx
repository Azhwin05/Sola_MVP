"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/client";
import { LEAD_PRIORITY_LABELS, type LeadPriority } from "@/lib/leads/constants";
import type { LeadDetail } from "@/components/leads/types";

export function LeadHeader({
  lead,
  canManage,
}: {
  lead: LeadDetail;
  canManage: boolean;
  customers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [converting, setConverting] = useState(false);

  async function convertToCustomer() {
    setConverting(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("convert_lead_to_customer", { p_lead_id: lead.id });
    setConverting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Customer created and linked");
    router.push(`/customers/${data}`);
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{lead.lead_number}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{lead.contact_name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{lead.company_name || "No company"}</p>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={lead.stage} />
          <Badge variant={lead.priority === "high" ? "destructive" : "secondary"}>
            {LEAD_PRIORITY_LABELS[lead.priority as LeadPriority] ?? lead.priority}
          </Badge>
          {lead.customer && (
            <Link href={`/customers/${lead.customer.id}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              Linked to {lead.customer.name}
            </Link>
          )}
        </div>
      </div>
      {canManage && !lead.customer_id && (
        <Button size="sm" variant="outline" onClick={convertToCustomer} disabled={converting}>
          <ArrowRightLeft className="h-4 w-4" />
          {converting ? "Converting…" : "Convert to Customer"}
        </Button>
      )}
    </div>
  );
}
