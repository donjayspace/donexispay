import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { getMerchantAdminOverview } from "@/server/modules/merchants/service";

export const dynamic = "force-dynamic";

export default async function AdminMerchantsPage() {
  await requireAdminPermission("merchants");
  const data = await getMerchantAdminOverview();
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Merchant operations</p><h1>Merchants</h1><p>Review merchant accounts and their current onboarding status.</p></div></section>
    <section className="admin-metric-grid">{Object.entries({ "All merchants": data.counts.total, "Pending": data.counts.pending, "Under review": data.counts.review, "Active": data.counts.active, "Restricted / suspended": data.counts.restricted }).map(([label, value]) => <article className="admin-metric-card" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></article>)}</section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Latest merchant records</h2><p>Read-only operational view; approval actions are intentionally not exposed yet.</p></div></header>
      {data.recent.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>Business</th><th>Slug</th><th>Country</th><th>Status</th><th>Created</th></tr></thead><tbody>{data.recent.map((m) => <tr key={m.id}><td><strong>{m.name}</strong><small className="admin-cell-sub">{m.id}</small></td><td><code>{m.slug}</code></td><td>{m.countryCode ?? "—"}</td><td><span className="admin-status">{m.status.replaceAll("_", " ")}</span></td><td>{m.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No merchants found</strong><p>Merchant accounts will appear when onboarding is connected to persistent records.</p></div>}
    </section>
  </div>;
}
