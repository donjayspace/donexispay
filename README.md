# DonexisPay

DonexisPay is a payment orchestration and hosted-checkout platform built as a Next.js full-stack modular monolith.

## Current implementation status

This repository is being initialized with the application foundation and documented module boundaries. Real payment execution remains disabled until a licensed provider is selected, configured, and tested. Do not use this scaffold to accept live payments yet.

## Technology

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod validation
- Server-side business modules under `server/modules/`
- Shared technical infrastructure under `server/infrastructure/`

## Quick start

1. Install Node.js LTS and PostgreSQL.
2. Copy `.env.example` to `.env` and set local values.
3. Install dependencies with `npm install`.
4. Generate the Prisma client with `npm run db:generate`.
5. Apply local migrations with `npm run db:migrate`.
6. Start development with `npm run dev`.

The initial database schema and provider interfaces are foundations, not evidence of production payment-provider approval or regulatory readiness.

## Security boundaries

- Never commit real credentials or production secrets.
- Never trust a browser redirect as proof of payment.
- Never mark a payment successful based only on an unverified webhook.
- Do not store raw card data or card verification codes.
- Do not enable live transactions until provider, security, operational, and legal reviews are complete.

See `docs/` for product requirements, architecture, security, provider integration, payment flows, and deployment guidance.
