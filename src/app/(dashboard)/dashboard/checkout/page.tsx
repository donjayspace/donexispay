import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function CheckoutSessionsPage() {
  return <WorkspacePlaceholder active="Checkout" eyebrow="Checkout" title="Checkout sessions" description="Create and inspect hosted checkout experiences." status="Session management actions are still being connected." items={[
    { title: "Hosted checkout", description: "A customer-facing session page with clear merchant, amount, and status details." },
    { title: "Session lifecycle", description: "Track expiry, cancellation, and payment status without trusting browser redirects." },
    { title: "Idempotent creation", description: "Avoid duplicate sessions when a client retries the same request." },
  ]} />;
}
