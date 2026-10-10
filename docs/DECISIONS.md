# Architecture Decision Records

## ADR-001: Modular monolith
**Status:** Accepted  
Use Next.js App Router and TypeScript as a full-stack modular monolith. Business modules live in `server/modules/`; shared technical infrastructure lives in `server/infrastructure/`. This reduces operational complexity while preserving boundaries.

## ADR-002: PostgreSQL and Prisma
**Status:** Accepted  
Use PostgreSQL for relational integrity and Prisma for schema/migrations and data access.

## ADR-003: Provider adapter boundary
**Status:** Accepted  
Provider SDK calls and provider-specific response mapping remain behind explicit adapter contracts.

## ADR-004: Live payments disabled by default
**Status:** Accepted  
`PAYMENTS_LIVE_ENABLED` defaults to false. The initial scaffold does not enable live transactions. Provider, security, legal, and operational gates must pass first.

## ADR-005: Exact monetary representation
**Status:** Accepted  
Store amounts as integer minor units using BigInt in the initial model. Currency exponents and provider conversion rules must be explicitly validated.

## ADR-006: Durable idempotency
**Status:** Accepted  
Payment-affecting operations require durable idempotency keys, request fingerprints, and database uniqueness constraints.

## ADR-007: No redirect-based payment confirmation
**Status:** Accepted  
A browser redirect is not authoritative proof of payment. Use verified provider events, authoritative status queries, and reconciliation.
