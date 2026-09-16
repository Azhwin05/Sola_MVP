"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ruler } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tables } from "@/lib/types/database";

type SurveyRow = Tables<"site_surveys"> & {
  lead: { id: string; contact_name: string; company_name: string | null } | null;
  customer: { id: string; name: string } | null;
  engineer: { id: string; full_name: string } | null;
};

export function SurveysTable({ surveys }: { surveys: SurveyRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surveys;
    return surveys.filter(
      (s) =>
        s.survey_number.toLowerCase().includes(q) ||
        (s.customer?.name ?? "").toLowerCase().includes(q) ||
        (s.lead?.contact_name ?? "").toLowerCase().includes(q),
    );
  }, [surveys, query]);

  if (surveys.length === 0) {
    return (
      <EmptyState
        icon={Ruler}
        title="No surveys yet"
        description="Site surveys start from a lead — open a lead and schedule one, or create it here."
      />
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search surveys…" className="mb-3 max-w-xs" />
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Survey</TableHead>
              <TableHead>Customer / Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Survey Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => router.push(`/surveys/${s.id}`)}>
                <TableCell className="font-medium text-foreground">{s.survey_number}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.customer?.name ?? s.lead?.company_name ?? s.lead?.contact_name ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.engineer?.full_name ?? "Unassigned"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(s.survey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
