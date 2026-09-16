import { AlertCircle } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PhaseRoadmap } from "@/components/shared/phase-roadmap";

export const metadata = { title: "Control Tower" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function ControlTowerPage() {
  const ctx = await getSessionContext();
  const supabase = await createClient();

  const { count: teamCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: roleCount } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName = ctx?.profile.full_name.split(" ")[0] ?? "";

  return (
    <div>
      <div className="pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-8 sm:grid-cols-4">
        <StatCard label="Team Members" value={teamCount ?? 0} href="/team" />
        <StatCard label="Roles Configured" value={roleCount ?? 0} href="/settings" />
        <StatCard label="Active Projects" value="—" />
        <StatCard label="Overdue Actions" value="—" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Attention Queue</h2>
          <EmptyState
            icon={AlertCircle}
            title="Nothing needs attention yet"
            description="Once leads, projects and procurement are tracked here, overdue actions, payment delays and QA failures will surface in this queue automatically."
          />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Build Roadmap</h2>
          <PhaseRoadmap />
        </section>
      </div>
    </div>
  );
}
