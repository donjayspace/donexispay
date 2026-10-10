# System Architecture

## Decision
Use a Next.js App Router + TypeScript modular monolith with PostgreSQL and Prisma. Business logic lives in `src/server/modules/`; shared technical capabilities live in `src/server/infrastructure/`. Background workers may run separately while reusing module services; do not split into microservices without a documented need.

## Request path
Browser/API request → route handler or server page → authentication and authorization → validated module service → repository/Prisma → database. Provider requests go through an adapter, never directly from React components.

## Layers and ownership
- `src/app/`: pages, layouts, route handlers, metadata, transport-level validation.
- `src/components/`: presentation and interaction components.
- `src/server/modules/`: business rules, use cases, schemas, repositories, provider orchestration, audit behavior.
- `src/server/infrastructure/`: database transactions, security, encryption, rate limiting, logging, cache/queues, storage, observability.
- `src/lib/`: lightweight shared helpers. Do not import server secrets or Prisma into client components.
- `prisma/`: schema, reviewed migrations, and synthetic non-production seed data.

## Module ownership
Auth owns user/admin identity and sessions; merchants owns workspaces/membership; onboarding owns eligibility workflow; checkout owns sessions and return URL policy; payments owns payment state/attempts; providers owns adapters/capabilities; payment-methods owns supported-method metadata; transactions owns history; customers owns merchant customer records; refunds owns refund lifecycle; billing owns platform invoices; payment-links owns shareable links; webhooks owns verified event processing; settlements/reconciliation own settlement matching; pricing owns fee rules; risk owns review cases; notifications owns delivery; audit owns immutable audit records; analytics owns derived metrics.

## Dependency rules
1. Modules call other modules through public service interfaces, not private repositories.
2. Avoid circular imports.
3. Route handlers authenticate, validate, call a use case, and map a safe response.
4. Client components never import Prisma, server modules, provider SDKs, or secret-bearing configuration.
5. Normalize provider statuses and payloads at the adapter boundary.
6. UI visibility is not authorization.

## Payment transaction pattern
Persist internal payment/attempt and idempotency records in a short transaction; commit; call the provider with a stable idempotency reference; persist the normalized response. Never hold a DB transaction open during network I/O. On ambiguous outcome, record an unknown/reviewable state and reconcile before retrying.

## Financial correctness
Use exact amounts, currency-specific exponents, explicit state transitions, uniqueness constraints for idempotency/provider events, and audit records for privileged actions. Correct completed financial history through compensating records, not destructive rewrites.

## Evolution
Extract a service only when independent scaling, isolation, ownership, or release cadence justifies the cost. Define contracts, event semantics, retries, data ownership, and reconciliation in an ADR first.
