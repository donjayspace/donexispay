import { WorkspacePlaceholder } from "@/components/layouts/workspace-placeholder";

export default function CustomersPage() {
  return <WorkspacePlaceholder active="Customers" eyebrow="Customer records" title="Customers" description="Manage customer references associated with merchant payment activity." status="Customer records are not connected yet." items={[
    { title: "Customer profiles", description: "Store only the customer information needed for supported payment workflows." },
    { title: "Privacy controls", description: "Scope every record to the merchant and honor retention and data-access requirements." },
    { title: "Payment history", description: "Show associated payments only after authorization and transaction services are in place." },
  ]} />;
}
