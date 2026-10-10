import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { listAdminRefunds } from "@/server/modules/refunds/admin-service";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await requireAdminPermission("refunds");
  const rows = await listAdminRefunds();
  return (
    <div className="admin-content">
      <section className="admin-page-heading">
        <div><p className="section-kicker">Payment operations</p><h1>Refund requests</h1><p>Review recorded requests and provider-confirmed outcomes. A request is not proof that funds have been returned.</p></div>
        <span className="admin-safe-badge">Read-only</span>
      </section>
      <section className="admin-panel">
        <header className="admin-panel-heading"><div><h2>Recent requests</h2><p>Execution requires a reviewed provider adapter and verified provider confirmation.</p></div></header>
        {rows.length ? (
          <div className="admin-table-scroll"><table className="admin-data-table">
            <thead><tr><th>Record</th><th>Payment</th><th>Amount</th><th>Status</th><th>Provider reference</th><th>Created</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id}>
              <td><code>{row.id}</code></td><td><code>{row.paymentId}</code></td>
              <td><strong>{row.currency} {row.amountMinor.toString()}</strong><small className="admin-cell-sub">Minor units</small></td>
              <td><span className="admin-status">{row.status}</span></td><td>{row.providerRefundId ?? "Not assigned"}</td><td>{row.createdAt.toLocaleString()}</td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className="admin-empty"><strong>No refund requests</strong><p>Requests will appear after an authorized merchant initiates one.</p></div>}
      </section>
    </div>
  );
}
