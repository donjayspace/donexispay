import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function DevelopersPage() {
  return <WorkspacePlaceholder active="Developers" eyebrow="Developer tools" title="Developers" description="Prepare your integration with versioned APIs and clear event contracts." status="API-key management and provider integration are not fully enabled." items={[
    { title: "API credentials", description: "Issue restricted, environment-specific keys and show secret material only once." },
    { title: "API reference", description: "Use versioned endpoints, schema validation, and stable error response formats." },
    { title: "Webhook events", description: "Verify signatures, deduplicate events, and retry deliveries safely." },
  ]} />;
}
