import Link from "next/link";
import { getPlatformOverview } from "@/server/modules/analytics/service";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getPlatformOverview();
  const metrics = [
    { label: "Registered users", value: overview.users.toLocaleString(), note: "Customer accounts" },
    { label: "Merchants", value: overview.merchants.toLocaleString(), note: "All onboarding states" },
    { label: "Payment records", value: overview.payments.toLocaleString(), note: "Persisted payment records" },
    { label: "Failed provider events", value: overview.failedEvents.toLocaleString(), note: "Require operational review" },
  ];

  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Platform operations</p><h1>Control centre</h1><p>Operational visibility for DonexisPay. Metrics are derived from persisted database records.</p></div><span className="admin-safe-badge">Live processing disabled by default</span></section>
    <div className="admin-notice"><strong>Production safety notice</strong><p>This console is protected by a separate administrator identity. Provider approval, legal review, incident procedures, and security checks remain required before live payment execution.</p></div>
    <section className="admin-metric-grid" aria-label="Platform metrics">{metrics.map((metric) => <article className="admin-metric-card" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>)}</section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Recent audit activity</h2><p>Latest recorded administrative and system events</p></div><Link href="/admin/audit">View audit trail →</Link></header>
      {overview.latestAudit.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Actor</th><th>Action</th><th>Outcome</th><th>Time</th></tr></thead><tbody>{overview.latestAudit.map((event) => <tr key={event.id}><td>{event.actorType}</td><td><code>{event.action}</code></td><td><span className="admin-status">{event.outcome}</span></td><td>{event.createdAt.toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No audit events yet</strong><p>Authentication and operational actions will appear here when recorded.</p></div>}
    </section>
    <section className="admin-shortcut-grid"><Link href="/admin/merchants"><strong>Merchant review</strong><span>Inspect merchant status and onboarding state →</span></Link><Link href="/admin/payments"><strong>Payment operations</strong><span>Review stored payment statuses →</span></Link><Link href="/admin/events"><strong>Webhook operations</strong><span>Inspect provider event processing →</span></Link><Link href="/admin/settings"><strong>System configuration</strong><span>Review safe configuration readiness →</span></Link></section>
  </div>;
}
