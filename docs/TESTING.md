# Testing Strategy

## Required layers
- Unit tests: state transitions, refund eligibility, idempotency, amount validation, provider status mapping.
- Integration tests: PostgreSQL constraints, transactions, repositories, webhook verification, queue/outbox behavior.
- API tests: authentication, authorization, validation, rate limits, stable error responses.
- End-to-end tests: checkout creation, payment lifecycle in sandbox, duplicate webhooks, merchant isolation, refund flow.
- Operational tests: restore backups, retry failed jobs, provider timeout recovery, and release rollback.

## Critical scenarios
- Same idempotency key and same request returns the same logical operation.
- Same key with a different payload is rejected.
- Concurrent requests cannot over-refund a payment.
- Provider timeout does not automatically mark payment failed.
- Duplicate or forged webhooks cannot duplicate or fabricate payment success.
- Out-of-order events do not improperly reverse terminal states.
- Merchant A cannot read Merchant B's checkout, payment, refund, or reports.
- Secrets and raw payment credentials never appear in logs or client responses.

## Test data
Use synthetic customer and merchant data. Use provider sandbox credentials and test cards/methods documented by the provider. Automated tests must never initiate live financial transactions.

## Release quality gates
Typecheck, lint, schema validation, automated tests, dependency/security review, migration review, and manual critical-flow verification must pass before release. A successful build alone is not a payment-readiness certification.
