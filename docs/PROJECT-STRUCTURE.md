# DonexisPay Project Structure

Keep the requested top-level structure. Add files beneath the correct module; do not create parallel architecture roots.

```text
donexispay/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
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
│   ├── server/
│   │   ├── modules/
│   │   │   ├── auth/ users/ merchants/ onboarding/ checkout/ payments/
│   │   │   ├── transactions/ providers/ payment-methods/ customers/
│   │   │   ├── refunds/ billing/ payment-links/ webhooks/ settlements/
│   │   │   ├── reconciliation/ pricing/ risk/ notifications/ audit/ analytics/
│   │   └── infrastructure/
│   │       ├── database/ security/ encryption/ queues/ observability/
│   │       └── logging/ cache/ configuration/ storage/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layouts/
│   └── lib/
│       ├── env.ts
│       ├── constants.ts
│       └── utils.ts
├── docs/
├── scripts/
├── prisma.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Suggested module convention
```text
src/server/modules/<module>/
├── domain/       # statuses, invariants, domain types
├── schemas/      # Zod input schemas
├── repositories/ # module-owned Prisma queries
├── services/     # use cases and orchestration
├── errors/       # safe domain errors when needed
├── types/        # public module types
└── index.ts      # deliberate public exports
```

Use only folders that have a real responsibility; empty boilerplate is not required. Provider modules may add `adapters/<provider>/` for clients, response mapping, capability declarations, and webhook verification.

## Responsibilities
- Route handler: authenticate, validate, call a service, return a safe response.
- Service: enforce business rules, coordinate transactions/provider calls, write audit/outbox records.
- Repository: data access scoped to the module and authenticated tenant.
- Schema: validate all untrusted inputs.
- Infrastructure: reusable technical capability, not product-specific policy.
- UI: display state and call authorized endpoints; never decide payment truth.

## Engineering conventions
Use strict TypeScript, server-only markers for secret-bearing modules, intentional public exports, and comments explaining business rules/safety decisions. Keep tests near modules or in a documented test directory. Commit only `pnpm-lock.yaml`; do not mix package managers. Never commit `.env.local`, production credentials, database dumps, or generated secrets.
