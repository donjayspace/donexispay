import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthenticatedAdmin } from "@/server/modules/auth/admin";

type Props = { children: ReactNode; admin: AuthenticatedAdmin };

const links = [
  { href: "/admin", label: "Overview", icon: "▦" },
  { href: "/admin/merchants", label: "Merchants", icon: "▤" },
  { href: "/admin/payments", label: "Payments", icon: "⇄" },
  { href: "/admin/refunds", label: "Refunds", icon: "↶" },
  { href: "/admin/settlements", label: "Settlements", icon: "⇅" },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: "≋" },
  { href: "/admin/risk", label: "Risk reviews", icon: "⛨" },
  { href: "/admin/billing", label: "Billing", icon: "$" },
  { href: "/admin/providers", label: "Providers", icon: "⌁" },
  { href: "/admin/events", label: "Provider events", icon: "↔" },
  { href: "/admin/users", label: "Users", icon: "♙" },
  { href: "/admin/administrators", label: "Administrators", icon: "♜" },
  { href: "/admin/audit", label: "Audit trail", icon: "≡" },
  { href: "/admin/settings", label: "System settings", icon: "⚙" },
];

/** Dedicated console shell: never reuses the customer dashboard session or nav. */
export function AdminShell({ children, admin }: Props) {
  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <Link className="brand-lockup" href="/admin"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <p className="admin-nav-label">PLATFORM CONTROL</p>
        <nav aria-label="Administrator navigation" className="admin-nav">
          {links.map((link) => <Link key={link.href} href={link.href} className="admin-nav-link"><span aria-hidden="true">{link.icon}</span>{link.label}</Link>)}
        </nav>
        <div className="admin-sidebar-bottom"><span className="admin-avatar">{admin.displayName.slice(0, 1).toUpperCase()}</span><span><strong>{admin.displayName}</strong><small>{admin.role.replaceAll("_", " ")}</small></span></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-status-dot" />Restricted administrator console <span className="admin-topbar-divider">/</span> <strong>{admin.role.replaceAll("_", " ")}</strong></div><form action="/api/admin/auth/logout" method="post"><button className="button button-secondary button-small" type="submit">Sign out</button></form></header>
        {children}
      </main>
    </div>
  );
}
