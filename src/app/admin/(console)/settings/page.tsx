import { requireAdminPermission } from "@/server/modules/auth/admin/permissions";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings");
  const items = [
    { label: "Application URL", value: env.APP_URL, state: "Configured" },
    { label: "Database", value: "Connection string present (value hidden)", state: "Configured" },
    { label: "Google OAuth", value: process.env.GOOGLE_CLIENT_ID ? "Client ID present" : "Not configured", state: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? "Configured" : "Pending" },
    { label: "GitHub OAuth", value: process.env.GITHUB_CLIENT_ID ? "Client ID present" : "Not configured", state: process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? "Configured" : "Pending" },
    { label: "Payment provider", value: process.env.PAYMENT_PROVIDER_NAME || "No provider selected", state: process.env.PAYMENT_PROVIDER_NAME ? "Configured" : "Pending" },
    { label: "Live payments", value: env.PAYMENTS_LIVE_ENABLED ? "Enabled by environment flag" : "Disabled", state: env.PAYMENTS_LIVE_ENABLED ? "Review required" : "Safe default" },
    { label: "Error monitoring", value: process.env.SENTRY_DSN ? "DSN present (value hidden)" : "Not configured", state: process.env.SENTRY_DSN ? "Configured" : "Optional" },
  ];
  return <div className="admin-content">
    <section className="admin-page-heading"><div><p className="section-kicker">Configuration readiness</p><h1>System settings</h1><p>Read-only view of deployment configuration. Secret values are never rendered.</p></div></section>
    <div className="admin-notice"><strong>Secrets stay outside the database UI</strong><p>Update environment variables through your hosting provider's secret manager. Never paste provider secrets into issue trackers, logs, or browser-visible settings.</p></div>
    <section className="admin-panel"><header className="admin-panel-heading"><div><h2>Environment readiness</h2><p>Presence checks only; this screen does not test external provider connectivity.</p></div></header><div className="admin-settings-list">{items.map((item) => <div className="admin-setting-row" key={item.label}><div><strong>{item.label}</strong><p>{item.value}</p></div><span className="admin-status">{item.state}</span></div>)}</div></section>
  </div>;
}
