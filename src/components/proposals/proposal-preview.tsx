import { BOM_CATEGORY_LABELS, type BomCategory } from "@/lib/engineering/constants";
import type { CapacityOutputs } from "@/lib/engineering/capacity";
import type { Tables } from "@/lib/types/database";
import type { LeadWithCustomer, RevisionWithBoms } from "@/components/proposals/types";

type BillingAddress = { line1?: string; city?: string; state?: string; pincode?: string };

export function ProposalPreview({
  version,
  lead,
  organization,
  revisions,
}: {
  version: Tables<"proposal_versions">;
  lead: LeadWithCustomer;
  organization: Tables<"organizations">;
  revisions: RevisionWithBoms[];
}) {
  const revision = revisions.find((r) => r.id === version.engineering_revision_id);
  const outputs = revision?.outputs as CapacityOutputs | undefined;
  const bom =
    revision?.boms.find((b) => b.id === version.bom_header_id) ??
    (revision ? [...revision.boms].sort((a, b) => b.version - a.version)[0] : undefined);
  const orgAddress = (organization.billing_address as BillingAddress) ?? {};

  const itemsByCategory = new Map<string, { qty: number; unit: string }[]>();
  for (const item of bom?.items ?? []) {
    const list = itemsByCategory.get(item.category) ?? [];
    list.push({ qty: item.final_quantity ?? item.quantity, unit: item.unit });
    itemsByCategory.set(item.category, list);
  }

  return (
    <article className="proposal-doc mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 text-sm text-foreground print:border-0 print:p-0 print:shadow-none">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .proposal-doc, .proposal-doc * { visibility: visible; }
          .proposal-doc { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <header className="mb-8 flex items-start justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{organization.name}</h1>
          <p className="text-xs text-muted-foreground">
            {[orgAddress.line1, orgAddress.city, orgAddress.state].filter(Boolean).join(", ")}
          </p>
          {organization.gstin && <p className="text-xs text-muted-foreground">GSTIN: {organization.gstin}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Proposal</p>
          <p className="font-semibold text-foreground">
            {version.proposal_number} <span className="text-muted-foreground">v{version.version}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(version.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Prepared For</h2>
        <p className="font-medium text-foreground">{lead.customer?.name ?? lead.company_name ?? lead.contact_name}</p>
        {lead.customer?.gstin && <p className="text-xs text-muted-foreground">GSTIN: {lead.customer.gstin}</p>}
      </section>

      {outputs && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Proposed System</h2>
          <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="font-medium text-foreground">{outputs.actualKwp.toFixed(1)} kWp</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Panels</p>
              <p className="font-medium text-foreground">{outputs.panelQty} nos</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. annual generation</p>
              <p className="font-medium text-foreground">{Math.round(outputs.estimatedAnnualGenerationKwh).toLocaleString("en-IN")} kWh</p>
            </div>
          </div>
        </section>
      )}

      {itemsByCategory.size > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Equipment</h2>
          <ul className="space-y-1">
            {Array.from(itemsByCategory.entries()).map(([cat, list]) => (
              <li key={cat} className="flex justify-between border-b border-dashed border-border py-1 text-sm">
                <span>{BOM_CATEGORY_LABELS[cat as BomCategory] ?? cat}</span>
                <span className="text-muted-foreground">
                  {list.reduce((s, i) => s + i.qty, 0).toFixed(1)} {list[0]?.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Commercial Proposal</h2>
        <div className="space-y-1 text-sm">
          <Row label="Equipment" value={version.equipment_cost} />
          <Row label="Installation" value={version.installation_cost} />
          {version.other_cost > 0 && <Row label="Other" value={version.other_cost} />}
          {version.discount > 0 && <Row label="Discount" value={-version.discount} />}
          <Row label="Subtotal" value={version.subtotal ?? 0} bold />
          <Row label={version.is_interstate ? `IGST (${version.tax_rate_percent}%)` : `CGST + SGST (${version.tax_rate_percent}%)`} value={version.tax_amount ?? 0} />
          <Row label="Total" value={version.total_amount ?? 0} bold large />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Payment Schedule</h2>
          <p className="text-sm text-foreground">{version.payment_terms || "—"}</p>
        </div>
        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Warranty</h2>
          <p className="text-sm text-foreground">
            {version.warranty_equipment_years ? `${version.warranty_equipment_years}-year equipment` : "—"}
            {version.warranty_workmanship_years ? `, ${version.warranty_workmanship_years}-year workmanship` : ""}
          </p>
        </div>
      </section>

      {version.scope && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Scope</h2>
          <p className="text-sm whitespace-pre-wrap text-foreground">{version.scope}</p>
        </section>
      )}
      {version.exclusions && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Exclusions</h2>
          <p className="text-sm whitespace-pre-wrap text-foreground">{version.exclusions}</p>
        </section>
      )}
      {version.assumptions && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Assumptions</h2>
          <p className="text-sm whitespace-pre-wrap text-foreground">{version.assumptions}</p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Terms</h2>
        <p className="text-xs text-muted-foreground">
          This proposal is valid for 30 days from the date above. Pricing excludes any subsidy or incentive not
          explicitly listed. Final scheduling is subject to site readiness and DISCOM approval timelines.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-6 border-t border-border pt-6">
        <div>
          <p className="text-xs text-muted-foreground">For {organization.name}</p>
          <div className="mt-8 border-t border-border pt-1 text-xs text-muted-foreground">Authorized Signatory</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Acceptance — {lead.customer?.name ?? lead.contact_name}</p>
          <div className="mt-8 border-t border-border pt-1 text-xs text-muted-foreground">Signature &amp; Date</div>
        </div>
      </section>
    </article>
  );
}

function Row({ label, value, bold, large }: { label: string; value: number; bold?: boolean; large?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : ""} ${large ? "text-base" : ""}`}>
      <span className={bold ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums text-foreground">
        {value < 0 ? "-" : ""}₹{Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}
