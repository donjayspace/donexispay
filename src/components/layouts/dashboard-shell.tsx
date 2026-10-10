import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/server/modules/auth";

type DashboardShellProps = {
  active: "Overview" | "Onboarding" | "Transactions" | "Checkout" | "Payment links" | "Customers" | "Refunds" | "Developers" | "Settings";
  children: ReactNode;
  breadcrumb?: string;
};

const primaryLinks = [
  { label: "Overview", href: "/dashboard", icon: "▦" },
  { label: "Transactions", href: "/dashboard/transactions", icon: "⇄" },
  { label: "Checkout", href: "/dashboard/checkout", icon: "▣" },
  { label: "Payment links", href: "/dashboard/payment-links", icon: "↗" },
  { label: "Customers", href: "/dashboard/customers", icon: "♙" },
  { label: "Refunds", href: "/dashboard/refunds", icon: "↶" },
];

export async function DashboardShell({ active, children, breadcrumb = "Overview" }: DashboardShellProps) {
  const user = await getCurrentUser();
  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label="Workspace navigation">
          <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
          <p className="sidebar-label">Workspace</p>
          <nav className="sidebar-nav" aria-label="Main menu">
            {primaryLinks.map((item) => <Link key={item.label} href={item.href} className={active === item.label ? "active" : ""} aria-current={active === item.label ? "page" : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
          </nav>
          <p className="sidebar-label">Manage</p>
          <nav className="sidebar-nav" aria-label="Management menu">
            <Link href="/dashboard/onboarding" className={active === "Onboarding" ? "active" : ""} aria-current={active === "Onboarding" ? "page" : undefined}><span aria-hidden="true">✓</span>Getting started</Link>
            <Link href="/dashboard/developers" className={active === "Developers" ? "active" : ""} aria-current={active === "Developers" ? "page" : undefined}><span aria-hidden="true">⌘</span>Developers</Link>
            <Link href="/dashboard/settings" className={active === "Settings" ? "active" : ""} aria-current={active === "Settings" ? "page" : undefined}><span aria-hidden="true">⚙</span>Settings</Link>
          </nav>
          <div className="sidebar-bottom"><div className="workspace-card"><span className="workspace-avatar">DP</span><span><strong>Demo workspace</strong><small>Development environment</small></span></div></div>
        </aside>
        <main className="dashboard-main">
          <header className="dashboard-topbar"><div className="breadcrumb">Workspace <span aria-hidden="true">/</span> <strong>{breadcrumb}</strong></div><div className="topbar-actions"><span className="environment-chip">Test environment</span><span className="account-email" title={user?.email}>{user?.name || user?.email || "Workspace account"}</span><form action="/api/auth/logout" method="post"><button className="button button-secondary button-small" type="submit">Sign out</button></form></div></header>
          {children}
        </main>
      </div>
    </div>
  );
}
