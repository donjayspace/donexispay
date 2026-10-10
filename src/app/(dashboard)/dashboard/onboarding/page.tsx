import Link from "next/link";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

const steps = [
  { number: "01", title: "Complete business profile", detail: "Add your legal business details and contact information.", state: "Preparation" },
  { number: "02", title: "Provider approval", detail: "Select a supported provider and complete its onboarding and approval process.", state: "Required" },
  { number: "03", title: "Configure test credentials", detail: "Store test credentials securely and keep test and live environments separate.", state: "Not configured" },
  { number: "04", title: "Verify checkout and webhooks", detail: "Run test transactions, validate signed events, and exercise retry handling.", state: "Not started" },
];

export default function OnboardingPage() {
  return (
    <DashboardShell active="Overview" breadcrumb="Onboarding">
      <div className="dashboard-content">
        <section className="dashboard-heading"><div><p className="dashboard-kicker">Getting started</p><h1>Set up your workspace</h1><p>Prepare the essentials before connecting a payment provider.</p></div><span className="environment-chip">Test environment</span></section>
        <section className="demo-banner"><span className="demo-banner-icon" aria-hidden="true">i</span><div><strong>Live payments remain disabled</strong><p>These are setup guidance items, not proof of regulatory approval. Do not enable real payments until provider approval, legal review, security controls, and operational readiness are complete.</p></div></section>
        <section className="onboarding-progress"><div><span>Setup progress</span><strong>0 of 4 steps complete</strong></div><div className="onboarding-progress-track"><span></span></div></section>
        <section className="onboarding-steps" aria-label="Setup steps">{steps.map((step) => <article className="onboarding-step" key={step.number}><span className="capability-number">{step.number}</span><div className="onboarding-step-copy"><h2>{step.title}</h2><p>{step.detail}</p><span className="status-pill">{step.state}</span></div><span className="onboarding-chevron" aria-hidden="true">→</span></article>)}</section>
        <div className="onboarding-footer"><p>Need to review the workspace first?</p><Link className="button button-secondary dashboard-button" href="/dashboard">Return to dashboard</Link></div>
      </div>
    </DashboardShell>
  );
}
