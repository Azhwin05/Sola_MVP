"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { SurveyStatus } from "@/lib/surveys/constants";
import type { Tables } from "@/lib/types/database";

export function SurveyStatusBar({ survey }: { survey: Tables<"site_surveys"> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reworkOpen, setReworkOpen] = useState(false);
  const [reworkComment, setReworkComment] = useState("");
  const status = survey.status as SurveyStatus;

  async function transition(next: SurveyStatus, extra: Record<string, unknown> = {}) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("site_surveys")
      .update({ status: next, ...extra })
      .eq("id", survey.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  async function submit() {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    await transition("submitted", { submitted_at: new Date().toISOString(), submitted_by: user?.id });
  }

  async function markReviewed() {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    await transition("reviewed", { reviewed_at: new Date().toISOString(), reviewed_by: user?.id });
  }

  async function approve() {
    await transition("approved", { review_status: "approved", review_comment: null });
  }

  async function requestRework() {
    if (!reworkComment.trim()) return;
    await transition("rework", { review_status: "rework", review_comment: reworkComment.trim() });
    setReworkOpen(false);
    setReworkComment("");
  }

  if (reworkOpen) {
    return (
      <div className="w-80 space-y-2 rounded-lg border border-border p-3">
        <Textarea
          value={reworkComment}
          onChange={(e) => setReworkComment(e.target.value)}
          placeholder="What needs to be redone?"
          rows={2}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={requestRework} disabled={busy || !reworkComment.trim()}>
            Send back for rework
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setReworkOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      {status === "draft" && (
        <Button size="sm" onClick={() => transition("scheduled")} disabled={busy}>
          Mark Scheduled
        </Button>
      )}
      {status === "scheduled" && (
        <Button size="sm" onClick={() => transition("assigned")} disabled={busy || !survey.engineer_id}>
          Mark Assigned
        </Button>
      )}
      {status === "assigned" && (
        <Button size="sm" onClick={() => transition("in_progress")} disabled={busy}>
          Start Survey
        </Button>
      )}
      {status === "in_progress" && (
        <Button size="sm" onClick={submit} disabled={busy}>
          Submit Survey
        </Button>
      )}
      {status === "submitted" && (
        <Button size="sm" onClick={markReviewed} disabled={busy}>
          Mark Reviewed
        </Button>
      )}
      {status === "reviewed" && (
        <>
          <Button size="sm" onClick={approve} disabled={busy}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setReworkOpen(true)} disabled={busy}>
            Request Rework
          </Button>
        </>
      )}
      {status === "rework" && (
        <Button size="sm" onClick={() => transition("in_progress")} disabled={busy}>
          Resume Work
        </Button>
      )}
    </div>
  );
}
