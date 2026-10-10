# Database Design

## Primary database
PostgreSQL with Prisma. The initial schema defines Merchant, CheckoutSession, Payment, PaymentAttempt, ProviderEvent, IdempotencyRecord, and AuditLog.

## Monetary representation
The initial schema stores amounts as integer minor units using `BigInt`. Currency exponent and provider conversion rules must be explicit; not every currency uses two decimal places. Validate maximum amount and safe conversions at boundaries.

## Integrity requirements
- Merchant order references are unique per merchant.
- Provider idempotency keys are unique within a provider.
- Provider event identifiers are unique per provider.
- Idempotency keys are scoped by merchant and operation.
- Financial records use restrictive deletion relationships where appropriate.
- Payment and provider references are indexed for investigation.
- Audit history must not be silently rewritten.

## Migration workflow
1. Update `prisma/schema.prisma`.
2. Run `npm run db:generate`.
3. In development, run `npm run db:migrate -- --name descriptive_change`.
4. Review generated SQL before committing.
5. Test migration against a disposable database and a staging-like dataset.
6. Deploy with `npm run db:deploy` in the release process.
7. Do not edit an already-applied migration; create a new corrective migration.

## Production safeguards
- Use separate credentials for development, staging, and production.
- Back up before high-risk schema changes.
- Prefer backward-compatible expand/migrate/contract changes.
- Never use destructive schema resets against production.
- Test restore procedures, not only backup creation.

## Future schema additions
Add authenticated users, merchant memberships, API key hashes, refund records, outbound webhook endpoints/deliveries, ledger accounts/journals, and reconciliation runs as their owning modules are implemented. Do not add balance semantics until the legal/business model is defined.
