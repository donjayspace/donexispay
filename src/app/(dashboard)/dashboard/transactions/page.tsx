import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function TransactionsPage() {
  return <WorkspacePlaceholder active="Transactions" eyebrow="Payment operations" title="Transactions" description="Follow payment attempts and their verified outcomes." status="Transaction records are not connected yet." items={[
    { title: "Payment timeline", description: "Review state changes and provider references when the payment backend is connected." },
    { title: "Search and filters", description: "Find transactions by date, currency, status, or your own order reference." },
    { title: "Safe exports", description: "Export authorized records with sensitive fields minimized and access audited." },
  ]} />;
}
