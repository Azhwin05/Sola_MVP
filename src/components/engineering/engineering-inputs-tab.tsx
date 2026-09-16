"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { calculateCapacity, CAPACITY_DEFAULTS, type CapacityInputs } from "@/lib/engineering/capacity";

export function EngineeringInputsTab({
  studyId,
  canManage,
  defaultUsableArea,
  monthlyConsumption,
  previousInputs,
}: {
  studyId: string;
  canManage: boolean;
  defaultUsableArea: number | null;
  monthlyConsumption: number[];
  previousInputs: CapacityInputs | null;
}) {
  const router = useRouter();
  const [availableRoofAreaSqm, setAvailableRoofAreaSqm] = useState(
    (previousInputs?.availableRoofAreaSqm ?? defaultUsableArea ?? "").toString(),
  );
  const [desiredOffsetPercent, setDesiredOffsetPercent] = useState((previousInputs?.desiredOffsetPercent ?? 90).toString());
  const [irradiation, setIrradiation] = useState((previousInputs?.irradiationKwhPerKwpPerDay ?? 4.5).toString());
  const [systemLossPercent, setSystemLossPercent] = useState(
    (previousInputs?.systemLossPercent ?? CAPACITY_DEFAULTS.systemLossPercent).toString(),
  );
  const [moduleWattageWp, setModuleWattageWp] = useState(
    (previousInputs?.moduleWattageWp ?? CAPACITY_DEFAULTS.moduleWattageWp).toString(),
  );
  const [tariffRatePerKwh, setTariffRatePerKwh] = useState((previousInputs?.tariffRatePerKwh ?? 8).toString());
  const [saving, setSaving] = useState(false);

  const hasConsumptionData = monthlyConsumption.length > 0;

  async function calculate() {
    setSaving(true);
    const inputs: CapacityInputs = {
      monthlyConsumptionKwh: monthlyConsumption,
      availableRoofAreaSqm: Number(availableRoofAreaSqm) || 0,
      desiredOffsetPercent: Number(desiredOffsetPercent) || 0,
      irradiationKwhPerKwpPerDay: Number(irradiation) || 0,
      systemLossPercent: Number(systemLossPercent) || 0,
      moduleWattageWp: Number(moduleWattageWp) || 0,
      tariffRatePerKwh: Number(tariffRatePerKwh) || 0,
    };
    const outputs = calculateCapacity(inputs);

    const supabase = createClient();
    const { error } = await supabase.rpc("create_engineering_revision", {
      p_study_id: studyId,
      p_inputs: inputs,
      p_outputs: outputs,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Capacity calculated — see the Capacity tab");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!hasConsumptionData && (
        <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          No EB bills recorded for this customer yet — add them under Engineering → EB Bills for an accurate
          consumption-based estimate. You can still calculate using assumed values below.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="roof_area">Available roof area (m²)</Label>
          <Input id="roof_area" type="number" step="0.1" value={availableRoofAreaSqm} onChange={(e) => setAvailableRoofAreaSqm(e.target.value)} disabled={!canManage} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="offset">Desired offset (%)</Label>
          <Input id="offset" type="number" step="1" value={desiredOffsetPercent} onChange={(e) => setDesiredOffsetPercent(e.target.value)} disabled={!canManage} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="irradiation">Irradiation (kWh/kWp/day)</Label>
          <Input id="irradiation" type="number" step="0.1" value={irradiation} onChange={(e) => setIrradiation(e.target.value)} disabled={!canManage} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loss">System losses (%)</Label>
          <Input id="loss" type="number" step="1" value={systemLossPercent} onChange={(e) => setSystemLossPercent(e.target.value)} disabled={!canManage} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wattage">Module wattage (Wp)</Label>
          <Input id="wattage" type="number" step="5" value={moduleWattageWp} onChange={(e) => setModuleWattageWp(e.target.value)} disabled={!canManage} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tariff">Tariff rate (₹/unit)</Label>
          <Input id="tariff" type="number" step="0.5" value={tariffRatePerKwh} onChange={(e) => setTariffRatePerKwh(e.target.value)} disabled={!canManage} />
        </div>
      </div>
      {canManage && (
        <Button onClick={calculate} disabled={saving}>
          {saving ? "Calculating…" : "Calculate & save revision"}
        </Button>
      )}
    </div>
  );
}
