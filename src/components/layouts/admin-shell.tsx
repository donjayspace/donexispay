import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthenticatedAdmin } from "@/server/modules/auth/admin";
import { AdminNavigation } from "@/components/layouts/admin-navigation";
import { canAdminAccess, type AdminPermission } from "@/server/modules/auth/admin/permissions";

type Props = { children: ReactNode; admin: AuthenticatedAdmin };

const links: { href: string; label: string; icon: string; permission: AdminPermission }[] = [
  { href: "/admin", label: "Overview", icon: "▦", permission: "overview" },
  { href: "/admin/merchants", label: "Merchants", icon: "▤", permission: "merchants" },
  { href: "/admin/payments", label: "Payments", icon: "⇄", permission: "payments" },
  { href: "/admin/refunds", label: "Refunds", icon: "↶", permission: "refunds" },
  { href: "/admin/settlements", label: "Settlements", icon: "⇅", permission: "settlements" },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: "≋", permission: "reconciliation" },
  { href: "/admin/risk", label: "Risk reviews", icon: "⛨", permission: "risk" },
  { href: "/admin/billing", label: "Billing", icon: "$", permission: "billing" },
  { href: "/admin/providers", label: "Providers", icon: "⌁", permission: "providers" },
  { href: "/admin/events", label: "Provider events", icon: "↔", permission: "events" },
  { href: "/admin/users", label: "Users", icon: "♙", permission: "users" },
  { href: "/admin/administrators", label: "Administrators", icon: "♜", permission: "administrators" },
  { href: "/admin/audit", label: "Audit trail", icon: "≡", permission: "audit" },
  { href: "/admin/settings", label: "System settings", icon: "⚙", permission: "settings" },
];

/** Dedicated console shell: never reuses the customer dashboard session or nav. */
export function AdminShell({ children, admin }: Props) {
  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <Link className="brand-lockup" href="/admin"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <p className="admin-nav-label">PLATFORM CONTROL</p>
        <AdminNavigation links={links.filter((link) => canAdminAccess(admin.role, link.permission))} />
        <div className="admin-sidebar-bottom"><span className="admin-avatar">{admin.displayName.slice(0, 1).toUpperCase()}</span><span><strong>{admin.displayName}</strong><small>{admin.role.replaceAll("_", " ")}</small></span></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-status-dot" />Restricted administrator console <span className="admin-topbar-divider">/</span> <strong>{admin.role.replaceAll("_", " ")}</strong></div><form action="/api/admin/auth/logout" method="post"><button className="button button-secondary button-small" type="submit">Sign out</button></form></header>
        {children}
      </main>
    </div>
  );
}
