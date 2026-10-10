# Compliance and Regulatory Readiness

This is an engineering checklist, not legal advice, legal classification, or proof of compliance. Requirements depend on legal entity, operating model, countries, flow of funds, payment methods, provider contracts, and data processed.

## Required business/legal decisions
Obtain qualified review of:
- whether the model requires licensing, registration, sponsorship, or a regulated partner;
- launch countries, merchant categories, sanctions, and prohibited-business screening;
- who contracts with merchants/payers, receives funds, controls settlement, and handles refunds/disputes;
- merchant KYB/KYC, AML, sanctions, monitoring, recordkeeping, and reporting obligations;
- consumer protection, disclosures, fees, complaint handling, and chargeback rules;
- privacy roles, lawful basis, data subject requests, cross-border transfers, retention, and breach notification;
- tax, invoicing, accounting, and reporting requirements.

## Payment data and PCI scope
Prefer provider-hosted checkout/fields. Map data flows before launch. Never store CVV or sensitive authentication data after authorization. Confirm PCI DSS scope and validation requirements with qualified assessors and provider/acquirer partners. Do not advertise compliance certification without evidence.

## Provider obligations
Review provider terms, settlement timing, reserves/holds, refunds, chargeback liability, acceptable use, webhook requirements, security questionnaires, and incident notification deadlines. Provider approval does not automatically satisfy all platform obligations.

## Evidence register
Keep versioned legal advice, provider approvals, risk assessments, data-flow diagrams, privacy notices, merchant terms, retention policy, incident plan, security review, penetration-test findings, and operational sign-offs. Record owner, date, review date, and evidence location.

## Live release gate
No live funds flow until the operating model is approved, provider approval is documented, controls are tested, contracts/disclosures are published, support and reconciliation owners are assigned, and applicable legal/regulatory/assessor requirements are met.
