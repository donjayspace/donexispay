# ADR-007: Do not confirm payment from browser redirects

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Customers may close tabs, modify query parameters, replay URLs, or return before a provider has finalized a payment. Redirects are not an authoritative payment channel.

## Decision
The return page provides neutral navigation only. Payment state changes to success only after a verified provider webhook or authenticated provider-side status query has been validated and persisted server-side.

## Consequences
The UI may show pending while the system resolves the payment. Reconciliation and status lookup are required for lost webhooks and uncertain outcomes.

## Security and operations
Never accept client-supplied status as proof. Test forged success query parameters, duplicate callbacks, late events, and provider timeouts.