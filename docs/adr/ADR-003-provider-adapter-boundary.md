# ADR-003: Isolate provider-specific behavior behind adapters

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Provider APIs differ in authentication, capabilities, status values, idempotency, webhooks, and refund semantics. Spreading these differences across payment services makes safe changes difficult.

## Options considered
Embed vendor calls in route handlers; create a provider-neutral adapter boundary; build a separate provider microservice immediately.

## Decision
Use a provider adapter contract under the providers module. Adapters own provider HTTP/SDK calls, capability declarations, signature verification, status mapping, and safe error normalization. Core payment services use internal types only.

## Consequences
Each integration needs contract tests and a capability matrix. The abstraction must represent real differences rather than pretend every provider supports every feature.

## Security and operations
Use environment-specific credentials, bounded timeouts, documented retry rules, redacted errors, and authoritative status lookup for uncertain outcomes. Live enablement requires provider approval.