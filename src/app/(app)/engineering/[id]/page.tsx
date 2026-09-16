import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext, hasPermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EngineeringInputsTab } from "@/components/engineering/engineering-inputs-tab";
import { EngineeringConsumptionTab } from "@/components/engineering/engineering-consumption-tab";
import { EngineeringCapacityTab } from "@/components/engineering/engineering-capacity-tab";
import { EngineeringBomTab } from "@/components/engineering/engineering-bom-tab";
import { EngineeringRevisionHistory } from "@/components/engineering/engineering-revision-history";
import type { CapacityInputs, CapacityOutputs } from "@/lib/engineering/capacity";

export default async function EngineeringStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!hasPermission(ctx, "engineering.view")) {
    redirect("/control-tower");
  }
  const canManage = hasPermission(ctx, "engineering.manage");

  const supabase = await createClient();
  const { data: study } = await supabase
    .from("engineering_studies")
    .select("*, lead:leads(id, contact_name, company_name), customer:customers(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (!study) notFound();

  const [{ data: revisions }, { data: bills }, { data: surveys }] = await Promise.all([
    supabase
      .from("engineering_revisions")
      .select("*")
      .eq("study_id", id)
      .order("revision_number", { ascending: false }),
    study.customer_id
      ? supabase
          .from("eb_bills")
          .select("*")
          .eq("customer_id", study.customer_id)
          .order("billing_month", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    supabase
      .from("site_surveys")
      .select("id, usable_area")
      .eq("lead_id", study.lead_id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const latestRevision = revisions?.[0] ?? null;
  const latestOutputs = (latestRevision?.outputs as CapacityOutputs | undefined) ?? null;
  const latestInputs = (latestRevision?.inputs as CapacityInputs | undefined) ?? null;

  const { data: latestBomHeader } = latestRevision
    ? await supabase
        .from("bom_headers")
        .select("*")
        .eq("revision_id", latestRevision.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: bomItems } = latestBomHeader
    ? await supabase.from("bom_items").select("*").eq("bom_header_id", latestBomHeader.id).order("sort_order")
    : { data: [] };

  return (
    <div>
      <div className="pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {study.customer?.name ?? study.lead?.company_name ?? study.lead?.contact_name}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <Link href={`/leads/${study.lead_id}`} className="hover:text-foreground hover:underline">
            View lead
          </Link>
          {" · "}
          {revisions?.length ?? 0} revision{(revisions?.length ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      <Tabs defaultValue={latestRevision ? "capacity" : "inputs"}>
        <TabsList>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="bom">BOM</TabsTrigger>
          <TabsTrigger value="history">Revision History</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="max-w-xl pt-6">
          <EngineeringInputsTab
            studyId={study.id}
            canManage={canManage}
            defaultUsableArea={surveys?.[0]?.usable_area ?? null}
            monthlyConsumption={(bills ?? []).map((b) => b.units_consumed)}
            previousInputs={latestInputs}
          />
        </TabsContent>

        <TabsContent value="consumption" className="pt-6">
          <EngineeringConsumptionTab bills={bills ?? []} />
        </TabsContent>

        <TabsContent value="capacity" className="pt-6">
          <EngineeringCapacityTab outputs={latestOutputs} />
        </TabsContent>

        <TabsContent value="bom" className="pt-6">
          <EngineeringBomTab
            latestRevisionId={latestRevision?.id ?? null}
            latestOutputs={latestOutputs}
            moduleWattageWp={latestInputs?.moduleWattageWp ?? null}
            bomHeader={latestBomHeader}
            items={bomItems ?? []}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          <EngineeringRevisionHistory revisions={revisions ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
