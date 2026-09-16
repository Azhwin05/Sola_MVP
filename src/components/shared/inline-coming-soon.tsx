import { Construction } from "lucide-react";

export function InlineComingSoon({ label, phase }: { label: string; phase: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <Construction className="mb-2 h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm font-medium text-foreground">{label} lands in {phase}</p>
    </div>
  );
}
