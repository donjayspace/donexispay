# Webhook Processing Guide

## Inbound provider events
1. Resolve the configured provider endpoint; do not trust provider identity claimed only in the payload.
2. Enforce content-type and body-size limits; read raw body when the signature scheme requires it.
3. Verify signature, timestamp, and replay protections against official provider documentation.
4. Validate the event envelope.
5. Persist using a unique key such as `(providerId, providerEventId)`.
6. Acknowledge only after durable receipt and according to the provider's delivery contract.
7. Process asynchronously only when a durable queue/outbox exists; otherwise use a safe bounded strategy and document limitations.
8. Apply state changes idempotently and record a safe processing outcome.

## Duplicates, ordering, and retry
Events can be duplicated, delayed, retried, or reordered. Duplicate delivery must not duplicate payments, refunds, ledger entries, notifications, or fulfillment. A late event must not regress terminal state. Conflicting evidence requires provider status lookup or reconciliation, not guessing.

## Outbound merchant webhooks
Persist an outbox event in the same transaction as the business state change. Deliver with bounded retries, exponential backoff, jitter, and a retention policy. Sign the exact body with an endpoint-specific secret; include event ID and timestamp. Support safe secret rotation and a documented verification example.

## Delivery safety
Use HTTPS, strict timeouts, response-size limits, destination validation, and SSRF protections. Do not follow arbitrary redirects to private/internal addresses. Protect against metadata endpoints and re-check destination resolution where needed.

## Operations and tests
Monitor signature failures, duplicate rates, backlog, processing latency, dead letters, and repeated delivery failures. Manual replay must be permissioned and audited and retain the original event identity. Test valid/invalid signatures, stale timestamps, malformed/oversize bodies, concurrent duplicates, out-of-order events, secret rotation, retry, and SSRF attempts.
