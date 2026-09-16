"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun } from "lucide-react";
import { NAV_ITEMS, NAV_GROUPS, NAV_GROUP_LABELS, type NavItem, type NavGroup } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  permissions,
  orgName,
}: {
  permissions: Set<string>;
  orgName: string;
}) {
  const pathname = usePathname();
  const visible = NAV_ITEMS.filter((item) => !item.permission || permissions.has(item.permission));

  const grouped = NAV_GROUPS.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: visible.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="hidden w-[15rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">{orgName}</span>
          <span className="block truncate text-[11px] text-subtle">Solar Business OS</span>
        </span>
      </div>

      <nav className="scrollbar-subtle flex-1 overflow-y-auto px-3 pb-4">
        {grouped.map((section, sectionIndex) => (
          <div key={section.group} className={cn(sectionIndex > 0 && "mt-5")}>
            {section.label && (
              <p className="px-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.08em] text-subtle uppercase">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors",
          active
            ? "bg-primary-light text-primary-dark dark:text-primary"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        {active && (
          <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <Icon
          className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary" : "text-subtle group-hover:text-muted-foreground")}
          strokeWidth={1.75}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}
