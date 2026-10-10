# Compliance and Regulatory Review

## Important
This document is an engineering checklist, not legal advice or proof of compliance. Requirements depend on the legal entity, operating model, geography, payment methods, providers, and data handled.

## Before launch
Obtain qualified review of:
- Whether the intended orchestration model requires licensing or registration.
- Countries and merchant categories that may be supported.
- Provider and acquiring partner terms.
- Merchant onboarding and verification obligations.
- Applicable AML/sanctions responsibilities, if any.
- Privacy, data protection, retention, and cross-border transfer requirements.
- Consumer disclosures, refunds, disputes, and complaint handling.
- Tax and financial reporting responsibilities.
- PCI DSS scope and validation obligations.
- Incident notification and recordkeeping requirements.

## Cardholder data
Prefer provider-hosted payment collection or provider tokenization to reduce exposure. Never store card verification codes after authorization. Do not assume that outsourcing payment collection removes all PCI DSS obligations; confirm scope with qualified assessors and providers.

## Data protection
Collect only necessary data, document purposes and retention, restrict access, secure exports, and implement deletion/retention workflows where legally appropriate. Financial and audit retention requirements may limit deletion.

## Provider boundaries
A provider's license or approval does not automatically authorize DonexisPay to perform every activity. The actual contractual and operational arrangement must be reviewed.

## Release gate
Keep live processing disabled until the operating model, target markets, provider approval, security posture, and applicable legal/compliance obligations have been reviewed and approved.
