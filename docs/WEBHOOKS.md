# Webhook Processing

## Inbound provider webhooks
1. Read the raw request body when required by the provider's signature scheme.
2. Verify signature, timestamp, and replay controls according to provider documentation.
3. Validate event envelope and provider identity.
4. Persist event identifier and payload using a provider-scoped unique key.
5. Acknowledge only according to the provider's documented delivery contract.
6. Process through an idempotent service/worker.
7. Validate the event against the current payment/refund record and permitted state transitions.
8. Record processing result and retryable failures.

Do not trust an event merely because its JSON says a payment succeeded. Invalid signatures must not change financial state.

## Duplicates and ordering
Provider retries are expected. Deduplicate by stable provider event ID where available. If the provider has no stable ID, define a documented fallback key. Out-of-order events must not reverse terminal states without an explicit reconciliation process.

## Outbound merchant webhooks
- HTTPS destinations only in production.
- Validate destinations and block loopback, private, link-local, and cloud metadata IP ranges to reduce SSRF risk.
- Revalidate redirects and DNS resolution where appropriate.
- Sign each payload with a per-endpoint secret.
- Include event ID, event type, and timestamp.
- Persist each delivery attempt.
- Retry transient failures with exponential backoff and bounded attempts.
- Support secret rotation and controlled replay.
- Never include secrets or unnecessary personal data.

## Reliability
Use a durable queue or transactional outbox for critical events. An in-memory task after returning an HTTP response is not a durable delivery mechanism.
