"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Invite = {
  id: string;
  email: string | null;
  token: string;
  expires_at: string;
  roles: { name: string } | null;
};

export function PendingInvites({ invites }: { invites: Invite[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {invites.map((invite) => (
        <li key={invite.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {invite.roles?.name ?? "Unknown role"}
              {invite.email && <span className="ml-2 font-normal text-muted-foreground">{invite.email}</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(invite.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Copy invite link"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join/${invite.token}`);
              toast.success("Link copied");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
