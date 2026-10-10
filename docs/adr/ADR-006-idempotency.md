# ADR-006: Use durable idempotency for payment-affecting operations

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Clients and providers retry requests due to timeouts and intermittent failures. Without durable deduplication, retries can create duplicate financial effects.

## Decision
Require idempotency keys on payment-affecting API operations. Scope keys by merchant and operation; persist a request fingerprint, resource reference, and replayable result under a unique database constraint. Reuse a stable provider idempotency reference where supported.

## Consequences
Same key and same payload replays the prior result; same key with different payload returns a conflict. Records must be retained while an operation can still be unresolved. Concurrency tests are required.

## Security and operations
A timeout is not proof of failure. Query the provider or reconcile before retrying an ambiguous operation. Never retry a potentially non-idempotent charge blindly.