import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { getUserAdminOverview } from "@/server/modules/users/service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPermission("users");
  const data = await getUserAdminOverview();
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Customer accounts</p><h1>Users</h1><p>Review user registration and account state. Administrator identities are stored separately.</p></div></section>
    <section className="admin-metric-grid">{Object.entries({ "All users": data.counts.total, "Verified email": data.counts.verified, "Disabled": data.counts.disabled }).map(([label, value]) => <article className="admin-metric-card" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></article>)}</section>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Recently registered users</h2><p>OAuth access tokens and session tokens are not returned to the console.</p></div></header>
      {data.recent.length ? <div className="admin-table-scroll"><table className="admin-data-table"><thead><tr><th>User</th><th>Email status</th><th>Linked providers</th><th>Sessions</th><th>Account</th><th>Joined</th></tr></thead><tbody>{data.recent.map((u) => <tr key={u.id}><td><strong>{u.name || "Unnamed user"}</strong><small className="admin-cell-sub">{u.email}</small></td><td>{u.emailVerified ? "Verified" : "Unverified"}</td><td>{u._count.oauthAccounts}</td><td>{u._count.sessions}</td><td><span className="admin-status">{u.disabledAt ? "Disabled" : "Active"}</span></td><td>{u.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>No registered users</strong><p>Customer accounts will appear here after OAuth registration.</p></div>}
    </section>
  </div>;
}
