import { ModuleComingSoon } from "@/components/shared/module-coming-soon";

export const metadata = { title: "Communications" };

export default function CommunicationsPage() {
  return (
    <ModuleComingSoon
      title="Communications"
      phase="Phase 8"
      description="Central communication timeline across internal comments, email and messaging adapters."
    />
  );
}
