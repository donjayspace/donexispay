# Development Roadmap

This roadmap defines delivery gates, not a claim that all listed features are implemented. Verify the repository and attach evidence before marking any item complete.

## Phase 0 — Foundation
- [ ] Clean install, stable build, environment validation, lint and typecheck.
- [ ] PostgreSQL/Prisma schema and reviewed initial migration.
- [ ] Request IDs, safe errors, structured logs, health endpoint.
- [ ] Architecture, route map, ADRs, local setup guide.
- Exit: clean CI build; live payments disabled.

## Phase 1 — Identity and merchant isolation
- [ ] Customer OAuth and session lifecycle.
- [ ] Separate admin credentials/session and login throttling.
- [ ] Merchant memberships and onboarding review.
- [ ] API key hashing, scopes, environment separation, rotation/revocation.
- Exit: tenant and role-boundary tests pass.

## Phase 2 — Checkout and payment records
- [ ] Hosted sessions, expiry, return URL policy.
- [ ] Durable idempotency with request fingerprints and concurrency tests.
- [ ] Payment/attempt persistence and unknown-outcome recovery.
- Exit: retries cannot create duplicate logical payment.

## Phase 3 — Provider sandbox
- [ ] Written provider/business approval and capability matrix.
- [ ] Adapter, sandbox integration, webhook verification, status query.
- [ ] Contract tests, timeout handling, reconciliation.
- Exit: sandbox scenarios pass; live gate remains false.

## Phase 4 — Operational finance
- [ ] Refund lifecycle where supported.
- [ ] Reconciliation import/matching and exception ownership.
- [ ] Settlement reporting and immutable audit trail.
- Exit: finance/operations review and exception runbook.

## Phase 5 — Production readiness
- [ ] Threat model, security review, dependency/secret scanning.
- [ ] Tested backups, incident response, monitoring and alert owners.
- [ ] Legal/compliance approval, merchant terms, privacy notices, support escalation.
- [ ] Staging rehearsal, migration/rollback plan, launch approval.
- Exit: accountable owners sign off every launch gate.

## Phase 6 — Expansion
Consider more providers, payment methods, analytics, automation, or service extraction only after measuring demand, risk, and operating cost. Record material decisions in ADRs.
