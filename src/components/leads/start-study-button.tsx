"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function StartStudyButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function start() {
    setStarting(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_or_create_engineering_study", { p_lead_id: leadId });
    setStarting(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not start study");
      return;
    }
    router.push(`/engineering/${data.id}`);
  }

  return (
    <Button size="sm" onClick={start} disabled={starting}>
      {starting ? "Starting…" : "Start Engineering Study"}
    </Button>
  );
}
