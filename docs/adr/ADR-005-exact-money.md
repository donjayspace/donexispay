# ADR-005: Represent money exactly

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Binary floating-point arithmetic can produce rounding errors and is unsuitable for authoritative payment amounts.

## Decision
Persist amounts as integer minor units using PostgreSQL/Prisma BigInt where appropriate. Validate currency codes and currency-specific exponents. Convert BigInt to strings in JSON responses; never serialize money as an imprecise JavaScript number.

## Consequences
Currency metadata and provider-specific conversion rules must be explicit. Validate bounds and reject values that cannot be represented safely. Fees, refunds, and settlements must use exact arithmetic.

## Security and operations
Tests must cover exponent differences, maximum values, zero/negative values, partial refunds, and currency mismatch. Any accounting ledger must use balanced, auditable entries and compensating reversals.