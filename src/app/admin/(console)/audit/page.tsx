import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { listAuditEvents } from "@/server/modules/audit/service";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdminPermission("audit");
  const events = await listAuditEvents(100);
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Security and accountability</p><h1>Audit trail</h1><p>Chronological records of authentication and operational actions.</p></div><span className="admin-safe-badge">Read-only</span></section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Latest audit records</h2><p>Up to 100 newest events. Sensitive metadata is not exposed in this view.</p></div></header>
      {events.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Outcome</th><th>Request</th></tr></thead><tbody>{events.map((e) => <tr key={e.id}><td>{e.createdAt.toLocaleString()}</td><td>{e.actorType}<small className="admin-cell-sub">{e.actorId ?? "system"}</small></td><td><code>{e.action}</code></td><td>{e.targetType}<small className="admin-cell-sub">{e.targetId ?? "—"}</small></td><td><span className="admin-status">{e.outcome}</span></td><td>{e.requestId ? <code>{e.requestId}</code> : "—"}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No audit records</strong><p>Recorded events will appear here.</p></div>}
    </section>
  </div>;
}
