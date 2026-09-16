"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  permissions,
  orgName,
}: {
  permissions: Set<string>;
  orgName: string;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.permission || permissions.has(item.permission));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Sun className="h-5 w-5 text-info" strokeWidth={1.75} />
        <span className="truncate text-sm font-semibold text-foreground">{orgName}</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
