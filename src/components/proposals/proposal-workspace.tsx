"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { ProposalPreview } from "@/components/proposals/proposal-preview";
import { ProposalActions } from "@/components/proposals/proposal-actions";
import type { Tables } from "@/lib/types/database";
import type { LeadWithCustomer, RevisionWithBoms } from "@/components/proposals/types";

export function ProposalWorkspace({
  lead,
  versions,
  revisions,
  organization,
  canManage,
}: {
  lead: LeadWithCustomer;
  versions: Tables<"proposal_versions">[];
  revisions: RevisionWithBoms[];
  organization: Tables<"organizations">;
  canManage: boolean;
}) {
  const [viewingId, setViewingId] = useState<string | null>(versions[0]?.id ?? null);
  const viewing = versions.find((v) => v.id === viewingId) ?? null;
  const isLatest = viewing ? viewing.id === versions[0]?.id : true;
  const editable = canManage && isLatest && (viewing ? viewing.status === "draft" : true);

  if (revisions.length === 0) {
    return (
      <div>
        <Header lead={lead} />
        <EmptyState
          icon={FileText}
          title="No capacity calculation yet"
          description="A proposal is built from an engineering revision and its BOM. Open this lead's Engineering tab and calculate capacity first."
        />
      </div>
    );
  }

  return (
    <div>
      <Header lead={lead} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">Versions</p>
          {versions.length === 0 && <p className="text-sm text-muted-foreground">No versions yet</p>}
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewingId(v.id)}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm ${
                v.id === viewingId ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <span>v{v.version}</span>
              <StatusBadge status={v.status} />
            </button>
          ))}
        </aside>

        <div>
          {editable ? (
            <ProposalEditor
              lead={lead}
              revisions={revisions}
              existingVersion={viewing}
              onSaved={(v) => setViewingId(v.id)}
            />
          ) : viewing ? (
            <div className="space-y-4">
              {canManage && <ProposalActions version={viewing} isLatest={isLatest} onNewVersion={(v) => setViewingId(v.id)} />}
              <ProposalPreview version={viewing} lead={lead} organization={organization} revisions={revisions} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Header({ lead }: { lead: LeadWithCustomer }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {lead.customer?.name ?? lead.company_name ?? lead.contact_name}
      </h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        <Link href={`/leads/${lead.id}`} className="hover:text-foreground hover:underline">
          View lead
        </Link>
      </p>
    </div>
  );
}
