# Payment Provider Integration Guide

## Approval gate
Do not select a provider based only on API availability. Confirm operating model, launch countries/currencies/methods, merchant categories, underwriting/KYB, settlement flow, refunds/disputes, webhook guarantees, support SLA, data terms, and written production approval.

## Adapter contract
Keep vendor behavior behind a provider adapter. Each adapter should declare provider ID/capabilities and implement supported payment creation/confirmation, authoritative status query, refunds where supported, webhook verification/parsing, status mapping, safe error normalization, timeout, retry, and idempotency rules. Core modules use internal types, not vendor SDK types.

## Integration workflow
1. Create a provider decision record and capability matrix.
2. Read official provider API and security documentation; pin a supported API version.
3. Configure sandbox-only credentials locally.
4. Implement a typed client with bounded timeouts/retries and redacted errors.
5. Implement signature verification according to the provider specification.
6. Add contract tests for success, decline, pending, timeout, duplicate/out-of-order events, and refund where supported.
7. Test outage and reconciliation behavior.
8. Complete security/legal review and obtain explicit approval before enabling live credentials.

## Idempotency and retries
Pass stable provider idempotency keys where supported. Never blindly retry a non-idempotent charge after timeout. Query by provider reference or reconcile first. Retry only documented transient failures using bounded exponential backoff and jitter.

## Configuration and certification
Use per-environment credentials and webhook secrets. Fail closed when required config is missing. Do not silently route live traffic to sandbox or another provider. Before launch, verify capabilities, restrictions, sandbox evidence, webhook authenticity, unknown outcomes, refund behavior, reconciliation ownership, and written provider approval.
