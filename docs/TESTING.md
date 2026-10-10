# Testing and Quality Gates

## Current local quality commands
```bash
pnpm run db:generate
pnpm run typecheck
pnpm run lint
pnpm run build
```
Check `package.json` before relying on a test script that may not yet exist. A clean build is not a substitute for automated tests.

## Required layers
- Unit: state transitions, amounts/currency, permissions, provider mapping, URL validation, idempotency fingerprints.
- Integration: PostgreSQL constraints, transaction behavior, repositories, session revocation, event uniqueness, queue/outbox behavior.
- API: authentication, scopes, merchant isolation, validation, rate limits, safe errors, BigInt serialization.
- Provider contract: sandbox success, decline, pending, timeout, status query, refund, invalid signature, duplicates and reordering.
- End-to-end: registration, onboarding, checkout, return, transaction history, admin roles, mobile layout/accessibility.
- Resilience/security: provider outage, database interruption, queue delay, replay, SSRF, secret rotation, brute-force throttling, concurrent idempotent requests.

## Financial invariants to test
Same-key concurrent requests create one logical operation. Same key with different payload conflicts. Timeout remains uncertain. Repeated success events do not double-fulfill. Failure events cannot regress confirmed success. Partial refunds cannot exceed captured amount. Currency mismatch is rejected. Merchant A cannot read merchant B records.

## Test data and safety
Use synthetic fixtures, sandbox credentials, and isolated databases. Never put real card data or production secrets in tests. Tests must not call live money-moving endpoints.

## Release gate
Require typecheck, lint, production build, schema/migration checks, unit/integration/API tests, dependency and secret scanning, manual checkout/accessibility review, and rollback rehearsal. Attach evidence to the release and block on unresolved critical/high security issues unless an accountable owner approves a documented mitigation.
