# Database and Local Development Guide

## Stack and ownership
PostgreSQL is the source of truth. Prisma schema is `prisma/schema.prisma`, migrations are under `prisma/migrations/`, and configuration is `prisma.config.ts`. The modular monolith uses one database initially; enforce module ownership through service boundaries and query discipline.

## Local setup
Requirements: Node.js 20.9+, the pnpm version in `package.json`, PostgreSQL, and Git.
```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Set DATABASE_URL to a local database and APP_SECRET to a unique random value.
pnpm run db:generate
pnpm run db:migrate
pnpm run typecheck
pnpm run lint
pnpm run dev
```
If no initial migration exists, use `pnpm exec prisma migrate dev --name init` against a local database, review the SQL, and commit it. Confirm available scripts in `package.json`.

## Schema and migration workflow
- Edit `schema.prisma`, generate a named migration locally, and review the SQL for destructive changes, locks, indexes, defaults, and backfills.
- Commit schema and migration together.
- CI should validate schema and build against a disposable/test database.
- Production applies committed migrations using `pnpm run db:deploy`; never run `migrate dev` in production.
- Use expand → backfill → contract for changes incompatible with the currently deployed application.
- Never edit an already-applied migration; create a corrective migration.

## Money and integrity
Store amounts as integer minor units (`BigInt`) and normalized ISO currency codes. Currency exponents differ; conversion must use explicit currency metadata and provider rules. Do not use floating point for money or serialize BigInt as a JSON number. Add constraints for merchant/order references, provider event IDs, and idempotency.

## Data access rules
Scope every merchant query by authenticated merchant context, never by an untrusted client-supplied ID alone. Preserve financial and audit history. Use synthetic fixtures, not production customer data. Define retention and deletion with legal/privacy review.

## Useful scripts
- `pnpm run db:generate`: generate Prisma client.
- `pnpm run db:migrate`: development migration workflow only.
- `pnpm run db:deploy`: apply committed migrations in deployment.
- `pnpm run db:status`: inspect migration status.
- `pnpm run db:studio`: local inspection only; never expose publicly.

## Backup and recovery
Production needs encrypted automated backups, documented retention, point-in-time recovery where available, and scheduled restore drills. A backup that has never been restored is not a verified recovery plan.
