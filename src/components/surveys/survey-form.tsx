"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { ORIENTATIONS } from "@/lib/surveys/constants";
import type { Tables } from "@/lib/types/database";

type Obstruction = { label: string; length: number | ""; width: number | "" };

export function SurveyForm({ survey, canManage }: { survey: Tables<"site_surveys">; canManage: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Site
  const [roofType, setRoofType] = useState(survey.roof_type ?? "");
  const [accessNotes, setAccessNotes] = useState(survey.access_notes ?? "");
  const [workingHours, setWorkingHours] = useState(survey.working_hours ?? "");
  const [gpsLat, setGpsLat] = useState(survey.gps_lat?.toString() ?? "");
  const [gpsLng, setGpsLng] = useState(survey.gps_lng?.toString() ?? "");

  // Measurements
  const [roofLength, setRoofLength] = useState(survey.roof_length?.toString() ?? "");
  const [roofWidth, setRoofWidth] = useState(survey.roof_width?.toString() ?? "");
  const [usableArea, setUsableArea] = useState(survey.usable_area?.toString() ?? "");
  const [tilt, setTilt] = useState(survey.tilt?.toString() ?? "");
  const [orientation, setOrientation] = useState(survey.orientation ?? "");
  const [obstructions, setObstructions] = useState<Obstruction[]>(
    Array.isArray(survey.obstructions) ? (survey.obstructions as Obstruction[]) : [],
  );

  // Electrical
  const [meterType, setMeterType] = useState(survey.meter_type ?? "");
  const [sanctionedLoad, setSanctionedLoad] = useState(survey.sanctioned_load?.toString() ?? "");
  const [transformerDetails, setTransformerDetails] = useState(survey.transformer_details ?? "");
  const [electricalPanel, setElectricalPanel] = useState(survey.electrical_panel ?? "");
  const [cableRoute, setCableRoute] = useState(survey.cable_route ?? "");
  const [inverterLocation, setInverterLocation] = useState(survey.inverter_location ?? "");

  // Shadow
  const [shadowObservations, setShadowObservations] = useState(survey.shadow_observations ?? "");
  const [obstructionNotes, setObstructionNotes] = useState(survey.obstruction_notes ?? "");

  // Notes
  const [observations, setObservations] = useState(survey.observations ?? "");
  const [risks, setRisks] = useState(survey.risks ?? "");
  const [recommendations, setRecommendations] = useState(survey.recommendations ?? "");

  function addObstruction() {
    setObstructions((o) => [...o, { label: "", length: "", width: "" }]);
  }
  function updateObstruction(i: number, patch: Partial<Obstruction>) {
    setObstructions((o) => o.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }
  function removeObstruction(i: number) {
    setObstructions((o) => o.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("site_surveys")
      .update({
        roof_type: roofType || null,
        access_notes: accessNotes || null,
        working_hours: workingHours || null,
        gps_lat: gpsLat ? Number(gpsLat) : null,
        gps_lng: gpsLng ? Number(gpsLng) : null,
        roof_length: roofLength ? Number(roofLength) : null,
        roof_width: roofWidth ? Number(roofWidth) : null,
        usable_area: usableArea ? Number(usableArea) : null,
        tilt: tilt ? Number(tilt) : null,
        orientation: orientation || null,
        obstructions,
        meter_type: meterType || null,
        sanctioned_load: sanctionedLoad ? Number(sanctionedLoad) : null,
        transformer_details: transformerDetails || null,
        electrical_panel: electricalPanel || null,
        cable_route: cableRoute || null,
        inverter_location: inverterLocation || null,
        shadow_observations: shadowObservations || null,
        obstruction_notes: obstructionNotes || null,
        observations: observations || null,
        risks: risks || null,
        recommendations: recommendations || null,
      })
      .eq("id", survey.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Survey saved");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Site</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="roof_type">Roof / access type</Label>
              <Input id="roof_type" value={roofType} onChange={(e) => setRoofType(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="access_notes">Access notes</Label>
              <Input id="access_notes" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} disabled={!canManage} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="working_hours">Working hours</Label>
                <Input id="working_hours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gps_lat">GPS lat</Label>
                <Input id="gps_lat" type="number" step="0.000001" value={gpsLat} onChange={(e) => setGpsLat(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gps_lng">GPS lng</Label>
                <Input id="gps_lng" type="number" step="0.000001" value={gpsLng} onChange={(e) => setGpsLng(e.target.value)} disabled={!canManage} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Measurements</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="roof_length">Roof length (m)</Label>
                <Input id="roof_length" type="number" step="0.1" value={roofLength} onChange={(e) => setRoofLength(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roof_width">Roof width (m)</Label>
                <Input id="roof_width" type="number" step="0.1" value={roofWidth} onChange={(e) => setRoofWidth(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usable_area">Usable area (m²)</Label>
                <Input id="usable_area" type="number" step="0.1" value={usableArea} onChange={(e) => setUsableArea(e.target.value)} disabled={!canManage} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tilt">Tilt (°)</Label>
                <Input id="tilt" type="number" step="1" value={tilt} onChange={(e) => setTilt(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label>Orientation</Label>
                <Select value={orientation || "none"} onValueChange={(v) => v && setOrientation(v === "none" ? "" : v)}>
                  <SelectTrigger className="w-full" disabled={!canManage}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unspecified</SelectItem>
                    {ORIENTATIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Obstructions</Label>
                {canManage && (
                  <Button type="button" size="xs" variant="ghost" onClick={addObstruction}>
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                )}
              </div>
              {obstructions.length === 0 && <p className="text-xs text-muted-foreground">None recorded</p>}
              {obstructions.map((ob, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Water tank"
                    value={ob.label}
                    onChange={(e) => updateObstruction(i, { label: e.target.value })}
                    disabled={!canManage}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="L (m)"
                    value={ob.length}
                    onChange={(e) => updateObstruction(i, { length: e.target.value ? Number(e.target.value) : "" })}
                    disabled={!canManage}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="W (m)"
                    value={ob.width}
                    onChange={(e) => updateObstruction(i, { width: e.target.value ? Number(e.target.value) : "" })}
                    disabled={!canManage}
                    className="w-20"
                  />
                  {canManage && (
                    <Button type="button" size="icon-xs" variant="ghost" onClick={() => removeObstruction(i)} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Electrical</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="meter_type">Meter type</Label>
                <Input id="meter_type" value={meterType} onChange={(e) => setMeterType(e.target.value)} disabled={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sanctioned_load">Sanctioned load (kVA)</Label>
                <Input id="sanctioned_load" type="number" step="0.1" value={sanctionedLoad} onChange={(e) => setSanctionedLoad(e.target.value)} disabled={!canManage} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transformer_details">Transformer details</Label>
              <Input id="transformer_details" value={transformerDetails} onChange={(e) => setTransformerDetails(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="electrical_panel">Electrical panel</Label>
              <Input id="electrical_panel" value={electricalPanel} onChange={(e) => setElectricalPanel(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cable_route">Cable route</Label>
              <Input id="cable_route" value={cableRoute} onChange={(e) => setCableRoute(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inverter_location">Inverter location</Label>
              <Input id="inverter_location" value={inverterLocation} onChange={(e) => setInverterLocation(e.target.value)} disabled={!canManage} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Shadow</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shadow_observations">Shadow observations</Label>
              <Textarea id="shadow_observations" rows={3} value={shadowObservations} onChange={(e) => setShadowObservations(e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obstruction_notes">Obstruction notes</Label>
              <Textarea id="obstruction_notes" rows={3} value={obstructionNotes} onChange={(e) => setObstructionNotes(e.target.value)} disabled={!canManage} />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Notes</h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="observations">Observations</Label>
            <Textarea id="observations" rows={3} value={observations} onChange={(e) => setObservations(e.target.value)} disabled={!canManage} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risks">Risks</Label>
            <Textarea id="risks" rows={3} value={risks} onChange={(e) => setRisks(e.target.value)} disabled={!canManage} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea id="recommendations" rows={3} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} disabled={!canManage} />
          </div>
        </div>
      </section>

      {canManage && (
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save survey"}
        </Button>
      )}
    </div>
  );
}
