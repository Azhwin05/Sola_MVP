"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Trash2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { generateDefaultBom } from "@/lib/engineering/bom";
import { BOM_CATEGORY_LABELS, type BomCategory } from "@/lib/engineering/constants";
import type { CapacityOutputs } from "@/lib/engineering/capacity";
import type { Tables } from "@/lib/types/database";

type Row = Tables<"bom_items">;

export function EngineeringBomTab({
  latestRevisionId,
  latestOutputs,
  moduleWattageWp,
  bomHeader,
  items,
  canManage,
}: {
  latestRevisionId: string | null;
  latestOutputs: CapacityOutputs | null;
  moduleWattageWp: number | null;
  bomHeader: Tables<"bom_headers"> | null;
  items: Row[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(items);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(rows) !== JSON.stringify(items);

  async function generate() {
    if (!latestRevisionId || !latestOutputs) return;
    setGenerating(true);
    const draft = generateDefaultBom(moduleWattageWp ?? 550, latestOutputs);
    const supabase = createClient();
    const { error } = await supabase.rpc("create_bom_from_revision", {
      p_revision_id: latestRevisionId,
      p_items: draft,
    });
    setGenerating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("BOM generated");
    router.refresh();
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function saveChanges() {
    setSaving(true);
    const supabase = createClient();
    const changed = rows.filter((r) => {
      const original = items.find((i) => i.id === r.id);
      return original && (original.quantity !== r.quantity || original.wastage_percent !== r.wastage_percent || original.estimated_rate !== r.estimated_rate);
    });
    const results = await Promise.all(
      changed.map((r) =>
        supabase
          .from("bom_items")
          .update({ quantity: r.quantity, wastage_percent: r.wastage_percent, estimated_rate: r.estimated_rate })
          .eq("id", r.id),
      ),
    );
    setSaving(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast.error(failed.error.message);
      return;
    }
    toast.success("BOM updated");
    router.refresh();
  }

  async function removeRow(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("bom_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  const total = rows.reduce((sum, r) => sum + (r.quantity * (1 + r.wastage_percent / 100) * r.estimated_rate), 0);

  if (!latestOutputs) {
    return (
      <EmptyState icon={PackageSearch} title="Calculate capacity first" description="A BOM is generated from a capacity calculation — fill in the Inputs tab first." />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {bomHeader ? `Version ${bomHeader.version}` : "No BOM generated yet"}
        </p>
        {canManage && (
          <Button size="sm" variant="outline" onClick={generate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating…" : bomHeader ? "Regenerate (new version)" : "Generate BOM"}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No BOM yet" description="Generate a starting BOM from the latest capacity calculation, then refine quantities and rates." />
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Wastage %</TableHead>
                  <TableHead className="text-right">Final Qty</TableHead>
                  <TableHead className="text-right">Rate (₹)</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  {canManage && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const finalQty = row.quantity * (1 + row.wastage_percent / 100);
                  const amount = finalQty * row.estimated_rate;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs text-muted-foreground">{BOM_CATEGORY_LABELS[row.category as BomCategory] ?? row.category}</TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{row.item}</p>
                        {row.specification && <p className="text-xs text-muted-foreground">{row.specification}</p>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) })}
                          disabled={!canManage}
                          className="w-20 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={row.wastage_percent}
                          onChange={(e) => updateRow(row.id, { wastage_percent: Number(e.target.value) })}
                          disabled={!canManage}
                          className="w-16 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {finalQty.toFixed(1)} {row.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={row.estimated_rate}
                          onChange={(e) => updateRow(row.id, { estimated_rate: Number(e.target.value) })}
                          disabled={!canManage}
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums font-medium text-foreground">
                        {amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <Button size="icon-xs" variant="ghost" onClick={() => removeRow(row.id)} aria-label="Remove item">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total estimate</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          {canManage && dirty && (
            <Button className="mt-3" size="sm" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
