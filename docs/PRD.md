# Product Requirements Document

## Vision
DonexisPay is a payment orchestration and hosted-checkout platform. The initial product coordinates payment requests through approved external providers; it is not automatically a bank, acquirer, payment network, or custodian of funds.

## MVP
- Merchant onboarding and server-side authorization.
- Secure merchant API credentials.
- Hosted checkout sessions.
- Provider adapter contract and one provider integration after provider selection.
- Payment attempts and normalized payment states.
- Verified, idempotent provider webhooks.
- Refunds where supported and approved.
- Transaction search, audit logs, and reconciliation workflows.
- Environment separation, monitoring, backup, and incident response.

## Non-goals
The MVP does not include issuing cards, holding customer balances, lending, building a card network, or performing regulated activities without required authorization. Live processing is disabled until provider, legal, security, and operational review is complete.

## Users
- Merchants: create checkout sessions and inspect their own transactions.
- Merchant developers: integrate APIs and webhooks.
- Administrators: review merchants and investigate transactions.
- Finance/operations staff: reconcile records and investigate exceptions.
- Customers: complete checkout and receive clear payment states.

## Core requirements
1. Every protected operation must authenticate and authorize server-side.
2. Merchant data must be tenant-scoped.
3. Money must use exact integer minor units or another documented exact representation.
4. Critical financial operations must be idempotent.
5. Provider timeouts must remain unresolved until reconciled.
6. Browser redirects must never prove payment success.
7. Provider webhooks must be verified and deduplicated.
8. Refund amounts must be protected against concurrent over-refunding.
9. Financial corrections must be auditable.
10. Secrets and raw card verification codes must never be logged or stored.

## MVP acceptance criteria
- Checkout sessions validate merchant, amount, currency, and expiry.
- Payment initiation records attempts before external calls.
- Duplicate requests cannot create duplicate financial effects.
- Unknown provider outcomes can be safely reconciled.
- Webhook signatures and duplicate deliveries are handled correctly.
- Refunds enforce eligibility and refundable-balance limits.
- Merchant authorization and access isolation are tested.
- Backups, restoration, monitoring, incident response, and deployment rollback are documented.
- Provider approval and applicable legal/compliance reviews are complete before live transactions.

## Decisions required
Select legal operating model, launch countries, provider, supported methods/currencies, merchant verification process, authentication mechanism, queue technology, availability targets, refund approval policy, and ledger scope before production launch.
