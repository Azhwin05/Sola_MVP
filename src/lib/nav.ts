import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Ruler,
  FileText,
  FolderKanban,
  ShoppingCart,
  Boxes,
  Wallet,
  HardHat,
  ShieldCheck,
  PlugZap,
  Activity,
  Wrench,
  UserSquare2,
  Files,
  MessagesSquare,
  BarChart3,
  UsersRound,
  Truck,
  Settings,
  History,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission key required to see this item. null = always visible once authenticated. */
  permission: string | null;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Control Tower", href: "/control-tower", icon: LayoutDashboard, permission: "control_tower.view" },
  { label: "Leads & CRM", href: "/leads", icon: ClipboardList, permission: "leads.view" },
  { label: "Customers", href: "/customers", icon: Building2, permission: "customers.view" },
  { label: "Site Surveys", href: "/surveys", icon: Ruler, permission: "surveys.view" },
  { label: "Engineering", href: "/engineering", icon: PlugZap, permission: "engineering.view" },
  { label: "Proposals", href: "/proposals", icon: FileText, permission: "proposals.view" },
  { label: "Projects", href: "/projects", icon: FolderKanban, permission: "projects.view" },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart, permission: "procurement.view" },
  { label: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory.view" },
  { label: "Finance", href: "/finance", icon: Wallet, permission: "finance.view" },
  { label: "Installation", href: "/installation", icon: HardHat, permission: "installation.view" },
  { label: "QA/QC", href: "/qa", icon: ShieldCheck, permission: "qa.view" },
  { label: "Commissioning", href: "/commissioning", icon: Activity, permission: "commissioning.view" },
  { label: "Monitoring", href: "/monitoring", icon: Activity, permission: "monitoring.view" },
  { label: "O&M / AMC", href: "/om", icon: Wrench, permission: "om.view" },
  { label: "Customer Portal", href: "/portal", icon: UserSquare2, permission: "customer_portal.view" },
  { label: "Documents", href: "/documents", icon: Files, permission: "documents.view" },
  { label: "Communications", href: "/communications", icon: MessagesSquare, permission: "communications.view" },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3, permission: "reports.view" },
  { label: "Team", href: "/team", icon: UsersRound, permission: "team.view" },
  { label: "Vendors", href: "/vendors", icon: Truck, permission: "vendors.view" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings.manage" },
  { label: "Audit Log", href: "/audit-log", icon: History, permission: "audit_log.view" },
];

// Phase 1 note: these route to the module's landing page rather than a
// dedicated /new form. Point them at real creation forms as each module
// is built (Phase 2+) rather than a route that doesn't exist yet.
export const CREATE_MENU_ITEMS: { label: string; href: string; permission: string | null }[] = [
  { label: "New Lead", href: "/leads", permission: "leads.manage" },
  { label: "New Customer", href: "/customers", permission: "customers.manage" },
  { label: "New Site Survey", href: "/surveys", permission: "surveys.manage" },
  { label: "New Proposal", href: "/proposals", permission: "proposals.manage" },
  { label: "New Project", href: "/projects", permission: "projects.manage" },
  { label: "New Purchase Order", href: "/procurement", permission: "procurement.manage" },
  { label: "New Invoice", href: "/finance", permission: "finance.manage" },
  { label: "New Service Ticket", href: "/om", permission: "om.manage" },
];
