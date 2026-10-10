# ADR-010: Persist and deduplicate provider webhook events

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Provider webhooks are commonly delivered at least once, may arrive out of order, and can be retried after timeouts. Processing every delivery as new can duplicate financial effects.

## Options considered
1. Process the event directly without durable identity.
2. Persist each provider event with a unique provider-scoped event identifier and process idempotently.
3. Depend on the provider to deliver exactly once.

## Decision
Verify authenticity, persist each event using a unique provider/event identifier, acknowledge only after durable receipt according to the provider contract, and apply business effects idempotently. Keep processing status and safe error details for retries and investigation.

## Consequences
The event pipeline needs uniqueness constraints, replay protection, bounded retries, operational monitoring, and reconciliation/dead-letter procedures.

## Security and operations
Verify signatures using the provider's documented raw-body and timestamp scheme. Manual replay must be permissioned and audited. Duplicate events must not duplicate payments, refunds, ledger entries, notifications, or fulfillment.
