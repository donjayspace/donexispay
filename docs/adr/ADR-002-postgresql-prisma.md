# ADR-002: PostgreSQL and Prisma

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Payment orchestration requires relational integrity, durable state, unique constraints, and auditable transaction boundaries.

## Options considered
PostgreSQL with Prisma; another relational database/ORM; document-first storage. PostgreSQL provides mature transactions and constraints, while Prisma offers typed schema-driven access compatible with the existing stack.

## Decision
Use PostgreSQL as the primary source of truth and Prisma for schema, migrations, and data access. The initial modular monolith uses one database; module data ownership is enforced by service boundaries and query discipline.

## Consequences
Schema and migration review are release-critical. Use foreign keys and uniqueness constraints for idempotency and provider event identity. Avoid destructive production migrations and use expand/backfill/contract for risky changes.

## Security and operations
Use separate database credentials per environment, least-privilege production access, encrypted backups, tested restoration, and no production data in local fixtures.