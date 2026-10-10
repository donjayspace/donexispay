# DonexisPay Engineering Documentation

This directory is the engineering source of truth for product requirements, architecture, implementation, security, payment behavior, operations, and decisions.

## Start here
1. [Product requirements](./PRD.md)
2. [System architecture](./ARCHITECTURE.md)
3. [Canonical project structure](./PROJECT-STRUCTURE.md)
4. [Route-to-file map](./ROUTES.md)
5. [Database and local development](./DATABASE.md)
6. [Environment variables and secrets](./ENVIRONMENT.md)

## Engineering guides
- [API conventions](./API.md)
- [Route map and page wiring](./ROUTES.md)
- [Security engineering](./SECURITY.md)
- [Payment flows](./PAYMENT-FLOWS.md)
- [Provider integration](./PROVIDERS.md)
- [Webhook processing](./WEBHOOKS.md)
- [Ledger and reconciliation](./LEDGER-AND-RECONCILIATION.md)
- [Testing and quality gates](./TESTING.md)

## Production readiness
- [Deployment and releases](./DEPLOYMENT.md)
- [Operations and incidents](./OPERATIONS.md)
- [Compliance readiness](./COMPLIANCE.md)
- [Roadmap](./ROADMAP.md)

## Architecture decisions
- [ADR index](./DECISIONS.md)
- [Individual ADRs and template](./adr/README.md)

## Local developer setup
Requirements: Node.js 20.9+, the pnpm version declared in `package.json`, PostgreSQL, and Git.

```bash
git clone https://github.com/donjayspace/donexispay.git
cd donexispay
pnpm install --frozen-lockfile
cp .env.example .env.local
# Set a local DATABASE_URL and a unique random APP_SECRET in .env.local.
pnpm run db:generate
pnpm run db:migrate
pnpm run typecheck
pnpm run lint
pnpm run dev
```

If there is no initial migration yet, create it against a local development database using `pnpm exec prisma migrate dev --name init`, review the SQL, and commit it. Confirm commands in `package.json`; never use `migrate dev` against production.

## Important release warning
A successful build does not mean DonexisPay is approved to process live payments. Keep `PAYMENTS_LIVE_ENABLED=false` until provider approval, legal/compliance review, security testing, financial reconciliation, monitoring, support ownership, and incident procedures are signed off. This documentation is engineering guidance, not legal advice or a compliance certification.
