import Link from "next/link";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

const checks = [
  { name: "Payment provider integration", detail: "No provider is configured", state: "Pending" },
  { name: "Live payment switch", detail: "Kept disabled by default", state: "Disabled" },
  { name: "Webhook verification", detail: "Provider signing keys not configured", state: "Pending" },
  { name: "Reconciliation", detail: "Waiting for provider settlement data", state: "Not configured" },
];

export default function AdminPage() {
  return (
    <DashboardShell active="Admin" breadcrumb="Admin console">
      <div className="dashboard-content">
        <section className="dashboard-heading"><div><p className="dashboard-kicker">Platform operations</p><h1>Admin console</h1><p>Review system readiness and the current integration state.</p></div><span className="environment-chip">Development only</span></section>
        <div className="demo-banner"><span className="demo-banner-icon" aria-hidden="true">!</span><div><strong>Admin UI preview — authorization is not connected</strong><p>This screen is not an access-control boundary. Do not expose sensitive operational data or enable administrative actions until server-side authentication and role-based authorization are implemented.</p></div></div>
        <section className="metric-grid" aria-label="Platform readiness">
          <article className="metric-card"><div className="metric-top"><span>Providers connected</span><span className="metric-icon">⌁</span></div><strong className="metric-value">0</strong><p className="metric-foot">No provider configured</p></article>
          <article className="metric-card"><div className="metric-top"><span>Live payments</span><span className="metric-icon">⛨</span></div><strong className="metric-value">Off</strong><p className="metric-foot">Safety default is active</p></article>
          <article className="metric-card"><div className="metric-top"><span>Webhook events</span><span className="metric-icon">↔</span></div><strong className="metric-value">—</strong><p className="metric-foot">No provider events received</p></article>
          <article className="metric-card"><div className="metric-top"><span>Open alerts</span><span className="metric-icon">!</span></div><strong className="metric-value">—</strong><p className="metric-foot">Monitoring integration pending</p></article>
        </section>
        <section className="dashboard-panel" style={{ marginTop: 18 }}><header className="panel-heading"><div><h2>Platform readiness</h2><p>Operational requirements before any live rollout</p></div><span className="status-pill">Review required</span></header><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Capability</th><th>Current state</th><th>Status</th></tr></thead><tbody>{checks.map((check) => <tr key={check.name}><td><strong>{check.name}</strong></td><td>{check.detail}</td><td><span className="status-pill">{check.state}</span></td></tr>)}</tbody></table></div></section>
        <section className="quick-actions"><Link className="quick-action" href="/dashboard"><span className="quick-action-icon">▦</span><span><strong>Merchant workspace</strong><small>Open the dashboard preview</small></span></Link><Link className="quick-action" href="/dashboard/developers"><span className="quick-action-icon">⌘</span><span><strong>Developer setup</strong><small>Review integration direction</small></span></Link><Link className="quick-action" href="/"><span className="quick-action-icon">↗</span><span><strong>Marketing site</strong><small>Return to the public homepage</small></span></Link></section>
      </div>
    </DashboardShell>
  );
}
