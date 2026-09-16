"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export function InviteMemberDialog({ roles }: { roles: { key: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [roleKey, setRoleKey] = useState(roles.find((r) => r.key !== "owner")?.key ?? roles[0]?.key ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    if (!roleKey) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_invite", {
      p_role_key: roleKey,
      p_email: email || undefined,
    });
    setLoading(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create invite");
      return;
    }
    setLink(`${window.location.origin}/join/${data.token}`);
    router.refresh();
  }

  function reset() {
    setLink(null);
    setEmail("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Invite Member
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            {link
              ? "Share this link with them — it works once and expires in 14 days."
              : "Generates a one-time join link scoped to the role you choose."}
          </DialogDescription>
        </DialogHeader>

        {link ? (
          <div className="flex items-center gap-2">
            <Input readOnly value={link} className="text-xs" />
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Link copied");
              }}
              aria-label="Copy invite link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={roleKey} onValueChange={(value) => value && setRoleKey(value)}>
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter((r) => r.key !== "owner")
                    .map((r) => (
                      <SelectItem key={r.key} value={r.key}>
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email (optional, for your reference)</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {link ? (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={loading || !roleKey}>
              {loading ? "Creating…" : "Create invite link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
