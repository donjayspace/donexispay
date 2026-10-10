import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function PaymentLinksPage() {
  return <WorkspacePlaceholder active="Payment links" eyebrow="Checkout tools" title="Payment links" description="Prepare reusable payment requests to share with customers." status="Payment link creation is not active yet." items={[
    { title: "Create a link", description: "Define an amount or an eligible customer-entered amount once pricing rules are supported." },
    { title: "Link lifecycle", description: "Set expiry, deactivate links, and inspect usage after service implementation." },
    { title: "Share with confidence", description: "Use platform-generated URLs and validate redirect destinations." },
  ]} />;
}
