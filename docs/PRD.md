# Product Requirements Document

## Vision
DonexisPay is a payment orchestration and hosted-checkout platform. It creates payment sessions, routes approved transactions through external providers, normalizes payment status, and gives merchants auditable records. It is not assumed to be a bank, card network, acquirer, custodian, or licensed payment institution.

## Personas
- Merchant owner: manages business onboarding, team access, API keys, checkout settings, and transaction history.
- Developer: integrates versioned APIs, idempotency, return URLs, and webhooks.
- Payer: completes hosted checkout and sees clear status.
- Operations/support: investigates unknown outcomes, provider events, refunds, and reconciliation exceptions.
- Administrator: uses a separate privileged identity system and role-based console.

## MVP requirements
1. Customer OAuth registration/sign-in. OAuth must never grant administrator privileges.
2. Merchant workspaces, membership roles, approval state, and server-side tenant isolation.
3. Test/live API keys with hashed secrets, scopes, revocation, expiry, and one-time secret display.
4. Hosted checkout sessions with server-validated amount, currency, expiry, and return URLs.
5. Provider adapter contract and one provider only after written approval and sandbox verification.
6. Durable idempotency, payment attempts, verified provider events, status checks, and an unknown/review state.
7. Refund lifecycle only when supported by the selected provider and operating model.
8. Auditable admin actions, operational views, alerts, and reconciliation.
9. Responsive, accessible marketing, merchant, checkout, and admin interfaces.

## Non-goals until approved
Holding funds, stored balances, lending, issuing cards, becoming an acquirer, unsupported currencies, smart routing across multiple providers, or claiming regulatory/PCI compliance.

## Product invariants
- Browser redirects are not proof of payment.
- A provider timeout is an uncertain outcome, not an automatic failure.
- Use exact monetary representation; never use floating-point arithmetic for money.
- Scope merchant-owned resources to the authenticated merchant on the server.
- Duplicate or out-of-order requests/events must not duplicate financial effects.
- Live payments remain disabled by default.

## Acceptance and release criteria
A candidate must pass typecheck, lint, tests, production build, migration review, tenant-isolation/authorization tests, duplicate webhook tests, timeout/retry tests, and checkout accessibility review. Sandbox evidence and operational runbooks are required. Live launch additionally requires provider approval and sign-off under [Security](./SECURITY.md), [Compliance](./COMPLIANCE.md), and [Deployment](./DEPLOYMENT.md).

## Open decisions
Record the legal entity and operating model, launch countries, currencies, provider, payment methods, fees, merchant eligibility, refund/dispute responsibility, retention schedule, service targets, and support model before committing to live behavior.
