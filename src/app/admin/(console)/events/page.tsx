import { getProviderEventAdminOverview } from "@/server/modules/webhooks/service";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const data = await getProviderEventAdminOverview();
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Webhook operations</p><h1>Provider events</h1><p>Monitor the delivery and processing lifecycle of provider notifications.</p></div></section>
    <section className="admin-metric-grid">{Object.entries({ "Total events": data.counts.total, "Received": data.counts.received, "Processing": data.counts.processing, "Processed": data.counts.processed, "Failed": data.counts.failed }).map(([label, value]) => <article className="admin-metric-card" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></article>)}</section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Recent event deliveries</h2><p>Raw payloads are intentionally hidden to reduce accidental exposure of customer or provider data.</p></div></header>
      {data.recent.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Provider</th><th>Event type</th><th>Provider event ID</th><th>Status</th><th>Received</th></tr></thead><tbody>{data.recent.map((e) => <tr key={e.id}><td>{e.providerId}</td><td><code>{e.eventType}</code></td><td><code>{e.providerEventId}</code></td><td><span className="admin-status">{e.status}</span></td><td>{e.receivedAt.toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No provider events</strong><p>Verified provider webhook deliveries will be recorded here when configured.</p></div>}
    </section>
  </div>;
}
