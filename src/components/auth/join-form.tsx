"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function JoinForm({
  token,
  organizationName,
  roleName,
  isAuthenticated,
  email: initialEmail,
}: {
  token: string;
  organizationName: string;
  roleName: string;
  isAuthenticated: boolean;
  email: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/join/${token}` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("accept_invite", { p_token: token, p_full_name: fullName });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/control-tower");
    router.refresh();
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" description={`We sent a confirmation link to ${email}.`}>
        <p className="text-sm text-muted-foreground">
          Click the link to verify your account and finish joining {organizationName}.
        </p>
      </AuthShell>
    );
  }

  if (isAuthenticated) {
    return (
      <AuthShell title={`Join ${organizationName}`} description={`You've been invited as ${roleName}`}>
        <form onSubmit={handleAccept} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Your full name</Label>
            <Input
              id="full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Sharma"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining…" : `Join as ${roleName}`}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={`Join ${organizationName}`} description={`You've been invited as ${roleName}`}>
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Create a password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
