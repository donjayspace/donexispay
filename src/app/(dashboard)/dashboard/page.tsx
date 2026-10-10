import Link from "next/link";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

const metrics = [
  { label: "Payment volume", value: "—", icon: "↗", foot: "Available after provider setup" },
  { label: "Successful payments", value: "—", icon: "✓", foot: "No live payment data yet" },
  { label: "Checkout sessions", value: "0", icon: "▣", foot: "No sessions in this preview" },
  { label: "Refunds processed", value: "—", icon: "↶", foot: "Refunds are not connected" },
];

const activities = [
  { icon: "⌁", title: "Payment provider", detail: "Choose and configure an approved provider.", status: "Not connected" },
  { icon: "⌘", title: "Developer credentials", detail: "Create and manage restricted API keys.", status: "Setup needed" },
  { icon: "✓", title: "Webhook delivery", detail: "Verify and deliver payment lifecycle events.", status: "Not enabled" },
];

export default function DashboardPage() {
  return (
    <DashboardShell active="Overview">
      <div className="dashboard-content">
        <section className="dashboard-heading">
          <div><p className="dashboard-kicker">Workspace overview</p><h1>Good to see you.</h1><p>Here is the current state of your payment workspace.</p></div>
          <Link className="button button-primary dashboard-button" href="/dashboard/developers">Explore developer tools <span aria-hidden="true">→</span></Link>
        </section>

        <section className="demo-banner" aria-label="Environment notice"><span className="demo-banner-icon" aria-hidden="true">i</span><div><strong>Development preview · Live payments are disabled</strong><p>This dashboard uses placeholder values. No real payment metrics are being reported. Connect an approved provider and complete required reviews before enabling live processing.</p></div></section>

        <section className="metric-grid" aria-label="Payment metrics">{metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><span className="metric-icon" aria-hidden="true">{metric.icon}</span></div><strong className="metric-value">{metric.value}</strong><p className="metric-foot">{metric.foot}</p></article>)}</section>

        <div className="dashboard-panels">
          <section className="dashboard-panel"><header className="panel-heading"><div><h2>Payment activity</h2><p>Activity will appear after integration</p></div><span className="status-pill">Awaiting setup</span></header><div className="empty-chart"><span className="empty-chart-icon" aria-hidden="true">⌁</span><h3>Your payment activity will live here</h3><p>Connect a provider and start receiving verified events to see payment activity and trends in this space.</p><Link className="button button-secondary dashboard-button" href="/dashboard/developers">View integration steps</Link></div></section>
          <section className="dashboard-panel"><header className="panel-heading"><div><h2>Setup checklist</h2><p>Prepare your workspace</p></div><span className="status-pill">0 of 3</span></header><div className="activity-list">{activities.map((item) => <div className="activity-item" key={item.title}><span className="activity-icon" aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><small>{item.detail}</small><small>{item.status}</small></div></div>)}</div></section>
        </div>

        <section className="quick-actions" aria-label="Quick actions"><Link className="quick-action" href="/dashboard/checkout"><span className="quick-action-icon" aria-hidden="true">▣</span><span><strong>Checkout sessions</strong><small>Review the checkout interface</small></span></Link><Link className="quick-action" href="/dashboard/payment-links"><span className="quick-action-icon" aria-hidden="true">↗</span><span><strong>Payment links</strong><small>Explore payment link workflows</small></span></Link><Link className="quick-action" href="/dashboard/settings"><span className="quick-action-icon" aria-hidden="true">⚙</span><span><strong>Workspace settings</strong><small>Review environment settings</small></span></Link></section>
      </div>
    </DashboardShell>
  );
}
