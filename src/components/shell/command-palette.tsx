"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NAV_ITEMS } from "@/lib/nav";

export function CommandPalette({
  permissions,
  open,
  onOpenChange,
}: {
  permissions: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const setOpen = onOpenChange;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const results = useMemo(() => {
    const visible = NAV_ITEMS.filter((item) => !item.permission || permissions.has(item.permission));
    if (!query.trim()) return visible;
    const q = query.toLowerCase();
    return visible.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, permissions]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Input
          autoFocus
          placeholder="Jump to a page…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-none border-0 border-b border-border px-4 py-6 text-sm focus-visible:ring-0"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matching pages.</li>
          )}
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <button
                  onClick={() => go(item.href)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
