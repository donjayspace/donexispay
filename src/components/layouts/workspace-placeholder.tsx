import { DashboardShell } from "@/components/layouts/dashboard-shell";

type WorkspaceArea = "Transactions" | "Checkout" | "Payment links" | "Customers" | "Refunds" | "Developers" | "Settings";

type WorkspacePlaceholderProps = {
  active: WorkspaceArea;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  items: Array<{ title: string; description: string }>;
};

export function WorkspacePlaceholder({ active, eyebrow, title, description, status, items }: WorkspacePlaceholderProps) {
  return (
    <DashboardShell active={active} breadcrumb={title}>
      <div className="dashboard-content">
        <section className="dashboard-heading"><div><p className="dashboard-kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><span className="environment-chip">Preview</span></section>
        <section className="demo-banner"><span className="demo-banner-icon" aria-hidden="true">i</span><div><strong>{status}</strong><p>This page is a responsive interface preview. Live records and actions will be enabled only when the related service, authorization, and provider workflows are implemented and verified.</p></div></section>
        <section className="capability-grid" style={{ marginTop: 18 }}>{items.map((item, index) => <article className="capability-card" key={item.title}><span className="capability-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</section>
        <section className="dashboard-panel" style={{ marginTop: 18 }}><header className="panel-heading"><div><h2>Workspace status</h2><p>What is available in this build</p></div><span className="status-pill">In development</span></header><div className="empty-chart"><span className="empty-chart-icon" aria-hidden="true">⌁</span><h3>No live records to display</h3><p>This area will populate when the corresponding backend workflow is implemented and connected. No transaction or customer data is fabricated for this preview.</p></div></section>
      </div>
    </DashboardShell>
  );
}
