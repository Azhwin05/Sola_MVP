import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Monitoring" };

export default function MonitoringPage() {
  return (
    <ModuleComingSoon
      title="Monitoring"
      phase="Phase 9"
      description="Normalized telemetry from inverter/smart-meter adapters — generation, consumption and alerts."
    />
  );
}
