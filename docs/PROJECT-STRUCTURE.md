# DonexisPay Project Structure

This is the canonical repository layout. Keep application routes under `src/app/`, business logic under `src/server/modules/`, shared technical infrastructure under `src/server/infrastructure/`, and shared lightweight helpers under `src/lib/`.

```text
donexispay/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── checkout/
│   │   ├── admin/
│   │   └── api/
│   │       ├── v1/
│   │       ├── webhooks/
│   │       └── health/
│   │
│   ├── server/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── merchants/
│   │   │   ├── onboarding/
│   │   │   ├── checkout/
│   │   │   ├── payments/
│   │   │   ├── transactions/
│   │   │   ├── providers/
│   │   │   ├── payment-methods/
│   │   │   ├── customers/
│   │   │   ├── refunds/
│   │   │   ├── billing/
│   │   │   ├── payment-links/
│   │   │   ├── webhooks/
│   │   │   ├── settlements/
│   │   │   ├── reconciliation/
│   │   │   ├── pricing/
│   │   │   ├── risk/
│   │   │   ├── notifications/
│   │   │   ├── audit/
│   │   │   └── analytics/
│   │   │
│   │   └── infrastructure/
│   │       ├── database/
│   │       ├── security/
│   │       ├── encryption/
│   │       ├── queues/
│   │       ├── observability/
│   │       ├── logging/
│   │       ├── cache/
│   │       ├── configuration/
│   │       └── storage/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layouts/
│   │
│   └── lib/
│       ├── env.ts
│       ├── constants.ts
│       └── utils.ts
│
├── prisma.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Directory responsibilities

- `prisma/`: the modular monolith's shared PostgreSQL schema and migration history. Module data ownership is enforced in application boundaries; do not split the database prematurely.
- `src/app/`: Next.js pages, layouts, route groups, and thin API route handlers. Route groups such as `(marketing)` do not change public URLs.
- `src/server/modules/`: domain rules, validation schemas, repositories, and use-case services grouped by business capability. A module owns its rules and exposes explicit public interfaces.
- `src/server/infrastructure/`: database access, security helpers, encryption, durable queue adapters, observability, logging, cache, environment configuration, and storage integrations.
- `src/components/`: reusable presentation components. Client components must not import server-only modules.
- `src/lib/`: small shared utilities, constants, and validated environment exports. Financial business rules belong in modules, not generic utilities.
- `public/`: static public assets only; never place secrets or private customer/payment documents here.

## Implementation rules

1. Keep route handlers thin; call a service from the owning module.
2. Keep provider-specific SDK calls behind `providers/` adapter contracts.
3. Do not trust browser redirects as proof of payment.
4. Persist idempotency and provider-event deduplication in PostgreSQL.
5. Use integer minor units or exact decimal representations for money; never use floating-point arithmetic.
6. Never hold a database transaction open while waiting for a provider network request.
7. Create feature files when implementing a feature; `.gitkeep` files only preserve intentionally planned directories.
8. Keep one package manager and its corresponding committed lockfile. The repository should use pnpm; generate and verify `pnpm-lock.yaml` with the repository's pinned pnpm version rather than hand-writing dependency resolutions.
9. Keep live payment execution disabled until provider approval, security checks, operational readiness, and applicable legal/compliance reviews are complete.
