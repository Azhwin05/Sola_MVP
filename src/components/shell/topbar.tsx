"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Bell, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CREATE_MENU_ITEMS } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Topbar({
  fullName,
  email,
  permissions,
  onOpenSearch,
}: {
  fullName: string;
  email: string;
  permissions: Set<string>;
  onOpenSearch: () => void;
}) {
  const router = useRouter();
  const createItems = CREATE_MENU_ITEMS.filter(
    (item) => !item.permission || permissions.has(item.permission),
  );

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-6">
      <button
        onClick={onOpenSearch}
        className="flex w-80 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-subtle shadow-xs transition-colors hover:border-border-strong hover:text-muted-foreground"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span>Search…</span>
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-subtle">
          Ctrl K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        {createItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="default">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {createItems.map((item) => (
                <DropdownMenuItem key={item.label} render={<Link href={item.href} />}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-sm" variant="ghost" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="ml-1 flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent" aria-label="Account menu">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initials(fullName) || "?"}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{fullName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} variant="destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
