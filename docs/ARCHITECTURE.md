# System Architecture

## Decision
Start with a Next.js App Router full-stack modular monolith. Business modules live in `server/modules/`; shared technical infrastructure lives in `server/infrastructure/`. Background workers may run as separate processes when required, without immediately splitting business modules into microservices.

## Layers
1. Presentation: `app/`, `components/`. Renders UI; never owns authoritative financial rules.
2. Transport: `app/api/`. Validates requests, authenticates callers, invokes services, maps results to HTTP.
3. Business: `server/modules/`. Owns business policies, state transitions, orchestration, and module invariants.
4. Infrastructure: `server/infrastructure/`. Database client, config, logging, queue, cryptography, monitoring, and technical adapters.
5. Persistence: PostgreSQL through Prisma, with constraints, indexes, and controlled migrations.

## Module ownership
- auth: authentication and sessions.
- users: user profiles and account state.
- merchants: merchant profile, onboarding, memberships, and status.
- checkout: checkout session lifecycle and expiry.
- payments: payment records, attempts, idempotency, and state transitions.
- providers: adapter contracts, provider SDKs, status mapping, and provider errors.
- refunds: eligibility, amounts, approval, and refund lifecycle.
- webhooks: inbound event verification/deduplication and outbound delivery.
- ledger: accounting entries where required by the approved operating model.
- reconciliation: provider comparisons and discrepancy workflow.
- audit: privileged and financial action history.
- notifications: delivery orchestration.
- reporting: authorized summaries and exports.
- admin: privileged use cases; it must call owning module services rather than duplicate rules.

## Dependency rules
- Route handlers call public module services.
- Modules may call their own repositories and public interfaces from other modules.
- A module must not import another module's private repository.
- Provider SDK calls remain behind provider adapters.
- Infrastructure must not implement business decisions.
- Client components must not import server-only code.
- Cross-module operations use explicit contracts and documented transaction boundaries.

## Payment flow
1. Validate caller, merchant, checkout, amount, and currency.
2. Persist an internal payment attempt and idempotency record.
3. Call provider adapter outside a long-running database transaction.
4. Persist provider response and references.
5. Resolve status from authoritative provider information, verified webhook, or status query.
6. Reconcile uncertain outcomes; never assume a timeout means failure.

## Database rules
- Use transactions for atomic internal state changes.
- Avoid holding DB transactions open across slow provider calls.
- Use unique constraints for idempotency and provider event deduplication.
- Preserve financial history and audit records.
- Do not use floating-point arithmetic for money.
- Use an outbox or durable queue for critical asynchronous events.

## Deployment
Deploy the Next.js application and PostgreSQL, plus a durable queue/worker when required. In-memory background tasks must not be relied upon for critical financial work. Production must include secret management, backups, monitoring, migration strategy, rollback, and recovery procedures.

## Future service extraction
Extract a module only when scaling, ownership, or security needs justify it. Define data ownership, API/event contracts, authentication, retry semantics, observability, and consistency before extraction.
