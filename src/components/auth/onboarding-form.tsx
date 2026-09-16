"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "org"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("bootstrap_organization", {
      p_org_name: orgName,
      p_org_slug: slugify(orgName),
      p_full_name: fullName,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/control-tower");
    router.refresh();
  }

  return (
    <AuthShell title="Set up your organization" description={`Signed in as ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">Your full name</Label>
          <Input
            id="full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Arun Kumar"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-name">Organization name</Label>
          <Input
            id="org-name"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Viryasys Technologies"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Setting up…" : "Create organization"}
        </Button>
      </form>
    </AuthShell>
  );
}
