import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function RefundsPage() {
  return <WorkspacePlaceholder active="Refunds" eyebrow="Payment operations" title="Refunds" description="Review refund eligibility and track provider-confirmed outcomes." status="Refund processing is unavailable until provider support is integrated." items={[
    { title: "Eligibility checks", description: "Validate payment state, refundable balance, currency, and provider capabilities." },
    { title: "Safe retry behavior", description: "Use idempotency keys and explicit pending states to prevent duplicate refund attempts." },
    { title: "Auditable decisions", description: "Record the actor, reason, provider response, and final refund state." },
  ]} />;
}
