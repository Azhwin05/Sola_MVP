import { scoreLead } from "@/lib/leads/scoring";
import type { Tables } from "@/lib/types/database";

export function LeadScore({ lead }: { lead: Tables<"leads"> }) {
  const { score, factors } = scoreLead(lead);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lead score</h3>
        <span className="text-2xl font-semibold tabular-nums text-foreground">{score}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        A transparent weighting of deal signals and data completeness — not a prediction of outcome.
      </p>
      <ul className="mt-3 space-y-2">
        {factors.map((f) => (
          <li key={f.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{f.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {f.points}/{f.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-info"
                style={{ width: `${(f.points / f.max) * 100}%` }}
              />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{f.explanation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
