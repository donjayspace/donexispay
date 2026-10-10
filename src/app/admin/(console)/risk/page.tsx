import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { listAdminRiskReviews } from "@/server/modules/risk/admin-service";
export const dynamic = "force-dynamic";
export default async function AdminRiskPage() {
  await requireAdminPermission("risk");
  const rows = await listAdminRiskReviews();
  return <div className="admin-content"><section className="admin-page-heading"><div><p className="section-kicker">Risk operations</p><h1>Risk reviews</h1><p>Review flagged transactions and recorded decisions. Scores are signals for human review, not proof of wrongdoing.</p></div></section><section className="admin-panel"><header className="admin-panel-heading"><div><h2>Risk review queue</h2><p>Decisions are auditable and require a separately authenticated administrator action.</p></div></header>{rows.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Review</th><th>Payment</th><th>Reason</th><th>Score</th><th>Status</th><th>Reviewed</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td><code>{r.id}</code></td><td><code>{r.paymentId}</code></td><td>{r.reasonCode ?? "—"}</td><td>{r.score ?? "—"}</td><td><span className="admin-status">{r.status}</span></td><td>{r.reviewedAt?.toLocaleString() ?? "Not reviewed"}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No risk reviews</strong><p>Reviews will appear when a transaction is flagged for manual assessment.</p></div>}</section></div>;
}
