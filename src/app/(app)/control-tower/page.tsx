import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PhaseRoadmap } from "@/components/shared/phase-roadmap";
import { ProjectHealthSummary } from "@/components/control-tower/project-health-summary";
import { calculateProjectHealth } from "@/lib/projects/health";
import type { ProjectStatus } from "@/lib/projects/constants";

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

  const { data: openLeads } = await supabase
    .from("leads")
    .select("id, lead_number, contact_name, company_name, estimated_value, next_action, next_action_date")
    .not("stage", "in", "(won,lost)");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_number, status, target_cod, customer:customers(name), tasks:project_tasks(status, due_date), risks:project_risks(impact, status)");

  const today = new Date(new Date().toDateString());
  const overdueLeads = (openLeads ?? [])
    .filter((l) => l.next_action_date && new Date(l.next_action_date) < today)
    .sort((a, b) => (a.next_action_date! < b.next_action_date! ? -1 : 1));

  const pipelineValue = (openLeads ?? []).reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);

  const activeProjects = (projects ?? []).filter((p) => !["operational", "cancelled"].includes(p.status));

  const projectHealths = activeProjects.map((p) => {
    const overdueTaskCount = p.tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < today && !["done", "cancelled"].includes(t.status),
    ).length;
    const openRisks = p.risks.filter((r) => r.status === "open") as { impact: "low" | "medium" | "high" }[];
    const result = calculateProjectHealth({
      status: p.status as ProjectStatus,
      targetCod: p.target_cod,
      overdueTaskCount,
      openRisks,
    });
    return { project: p, ...result };
  });

  const healthCounts = { healthy: 0, at_risk: 0, delayed: 0, blocked: 0 };
  for (const h of projectHealths) healthCounts[h.health]++;

  const projectAttention = projectHealths
    .filter((h) => h.health === "blocked" || h.health === "delayed")
    .slice(0, 5);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
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
        <p className="mt-1 text-sm text-muted-foreground">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Team Members" value={teamCount ?? 0} href="/team" />
        <StatCard label="Open Leads" value={openLeads?.length ?? 0} href="/leads" />
        <StatCard
          label="Pipeline Value"
          value={pipelineValue > 0 ? `₹${(pipelineValue / 100000).toFixed(1)}L` : "₹0"}
          href="/leads"
        />
        <StatCard label="Active Projects" value={activeProjects.length} href="/projects" />
        <StatCard
          label="Overdue Actions"
          value={overdueLeads.length + healthCounts.delayed + healthCounts.blocked}
          href="/leads"
          tone={overdueLeads.length + healthCounts.delayed + healthCounts.blocked > 0 ? "destructive" : "neutral"}
        />
        <StatCard label="Roles Configured" value={roleCount ?? 0} href="/settings" />
      </div>

      <div className="grid grid-cols-1 gap-4 pb-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Project Health</h2>
          <ProjectHealthSummary counts={healthCounts} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Build Roadmap</h2>
          <PhaseRoadmap />
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Attention Queue</h2>
        {overdueLeads.length === 0 && projectAttention.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="Nothing needs attention"
            description="Overdue lead follow-ups and at-risk projects will surface here automatically."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {projectAttention.map(({ project, health, reasons }) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.project_number} · {project.customer?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{reasons[0]}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${health === "blocked" ? "text-destructive" : "text-warning"}`}>
                    {health === "blocked" ? "Blocked" : "Delayed"}
                  </span>
                </Link>
              </li>
            ))}
            {overdueLeads.slice(0, 5).map((lead) => (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {lead.company_name || lead.contact_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{lead.next_action}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-destructive">
                    Due {new Date(lead.next_action_date!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
