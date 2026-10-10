import { getPaymentAdminOverview } from "@/server/modules/payments/service";

export const dynamic = "force-dynamic";

function formatMoney(minor: bigint, currency: string) {
  // Use integer minor units; never convert money amounts through JavaScript floating point.
  const digits = ["JPY", "KRW", "VND", "CLP"].includes(currency.toUpperCase()) ? 0 : 2;
  const divisor = 10n ** BigInt(digits);
  const whole = minor / divisor;
  const fraction = digits ? (minor % divisor).toString().padStart(digits, "0") : "";
  return `${currency.toUpperCase()} ${whole.toString()}${digits ? `.${fraction}` : ""}`;
}

export default async function AdminPaymentsPage() {
  const data = await getPaymentAdminOverview();
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Payment operations</p><h1>Payments</h1><p>Inspect persisted payment states. A success state must come from verified server-side provider processing.</p></div><span className="admin-safe-badge">Read-only</span></section>
    <section className="admin-metric-grid">{Object.entries({ "Total records": data.counts.total, "Succeeded": data.counts.successful, "In progress / review": data.counts.processing, "Failed / canceled": data.counts.failed }).map(([label, value]) => <article className="admin-metric-card" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></article>)}</section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Recent payments</h2><p>Provider identifiers are shown for internal troubleshooting; secrets are never displayed.</p></div></header>
      {data.recent.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Payment</th><th>Amount</th><th>Status</th><th>Provider</th><th>Created</th></tr></thead><tbody>{data.recent.map((p) => <tr key={p.id}><td><code>{p.id}</code></td><td><strong>{formatMoney(p.amountMinor, p.currency)}</strong></td><td><span className="admin-status">{p.status.replaceAll("_", " ")}</span></td><td>{p.providerId ?? "Not assigned"}</td><td>{p.createdAt.toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No payment records</strong><p>Payment records will appear after a configured provider flow is enabled.</p></div>}
    </section>
  </div>;
}
