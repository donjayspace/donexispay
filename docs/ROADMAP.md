# Implementation Roadmap

## Phase 0 — Repository foundation
- Next.js, TypeScript, lint/typecheck scripts.
- Environment validation and Prisma client.
- Initial PostgreSQL schema.
- Error response convention and health endpoint.
- Architecture and security documentation.
- Live payments disabled by default.

## Phase 1 — Identity and merchant security
- User/session authentication.
- Merchant membership and server-side authorization.
- API key issuance, hashing, scopes, rotation, and revocation.
- Audit events and authentication rate limiting.
- Tenant-isolation tests.

## Phase 2 — Checkout and payment records
- Checkout session service and secure retrieval token.
- Merchant API endpoint with authentication and idempotency.
- Session expiry and return URL policy.
- Payment/attempt repositories and state transition service.
- Safe checkout UI and status page.

## Phase 3 — First provider
- Select and obtain approval from a provider.
- Implement adapter, timeouts, error mapping, and sandbox tests.
- Implement authoritative payment status retrieval.
- Verify provider webhooks and deduplicate events.
- Test unknown outcomes and recovery.

## Phase 4 — Refunds and reconciliation
- Refund data model and concurrent refundable amount protection.
- Provider refund adapter where supported.
- Reconciliation runs, discrepancy queue, and resolution audit.
- Reporting with currency-safe aggregation.

## Phase 5 — Production readiness
- Threat model and security review.
- Legal/compliance and provider approval.
- Load/failure-mode testing.
- Monitoring, alerting, backups, restore drills, incident response.
- Controlled production rollout with live payments disabled until all gates pass.

## Phase 6 — Expansion
- Additional providers and methods.
- Safe routing/failover only after unknown outcomes are resolved.
- Advanced reporting and reconciliation automation.
- Extract workers or modules only when operational evidence justifies it.

## Release rule
No phase is considered complete merely because code compiles. Requirements, tests, operational readiness, and applicable legal/provider approvals must also pass.
