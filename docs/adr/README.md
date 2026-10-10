# Architecture Decision Records

Use one Markdown file per material decision. Copy `ADR-TEMPLATE.md`, use the next ID, and record status, context, options, decision, consequences, security/operations impact, and follow-up work. Accepted ADRs document intent; they do not prove implementation is complete.

## Records
- [ADR-001 Modular monolith](./ADR-001-modular-monolith.md)
- [ADR-002 PostgreSQL and Prisma](./ADR-002-postgresql-prisma.md)
- [ADR-003 Provider adapter boundary](./ADR-003-provider-adapter-boundary.md)
- [ADR-004 Live payments disabled by default](./ADR-004-live-payments-gate.md)
- [ADR-005 Exact monetary representation](./ADR-005-exact-money.md)
- [ADR-006 Durable idempotency](./ADR-006-idempotency.md)
- [ADR-007 No redirect-based payment confirmation](./ADR-007-payment-confirmation.md)
- [ADR-008 Separate customer and admin identity](./ADR-008-separate-admin-identity.md)
- [ADR-009 pnpm package manager](./ADR-009-pnpm.md)
- [ADR-010 Webhook event deduplication](./ADR-010-webhook-deduplication.md)

## ADR template
Create `ADR-TEMPLATE.md` for new decisions. Do not renumber existing ADRs; use `Supersedes` when changing an accepted decision.
