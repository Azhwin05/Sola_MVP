import { Zap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import type { CapacityOutputs } from "@/lib/engineering/capacity";

export function EngineeringCapacityTab({ outputs }: { outputs: CapacityOutputs | null }) {
  if (!outputs) {
    return (
      <EmptyState
        icon={Zap}
        title="No calculation yet"
        description="Fill in the Inputs tab and calculate to see the recommended system capacity here."
      />
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Recommended Capacity" value={`${outputs.actualKwp.toFixed(1)} kWp`} />
        <StatCard label="Panel Count" value={outputs.panelQty} />
        <StatCard label="Inverter Size" value={`${outputs.inverterSizingKw} kW`} />
        <StatCard
          label="Est. Annual Savings"
          value={`₹${Math.round(outputs.estimatedAnnualSavings).toLocaleString("en-IN")}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Avg. monthly consumption</p>
          <p className="font-medium text-foreground">{Math.round(outputs.avgMonthlyConsumptionKwh).toLocaleString("en-IN")} kWh</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Target annual generation</p>
          <p className="font-medium text-foreground">{Math.round(outputs.targetAnnualGenerationKwh).toLocaleString("en-IN")} kWh</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Est. annual generation</p>
          <p className="font-medium text-foreground">{Math.round(outputs.estimatedAnnualGenerationKwh).toLocaleString("en-IN")} kWh</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Assumptions</h3>
        <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          {outputs.assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
