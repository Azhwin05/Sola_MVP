"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";

export function AppShell({
  orgName,
  fullName,
  email,
  permissions,
  children,
}: {
  orgName: string;
  fullName: string;
  email: string;
  permissions: Set<string>;
  children: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar permissions={permissions} orgName={orgName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          fullName={fullName}
          email={email}
          permissions={permissions}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="scrollbar-subtle flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-7">{children}</div>
        </main>
      </div>
      <CommandPalette permissions={permissions} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
