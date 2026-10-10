# ADR-004: Disable live payments by default

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Code that can call a provider must not accidentally initiate real-money transactions before approval and operational controls are complete.

## Options considered
Enable live behavior when credentials exist; enable through an explicit environment gate; rely on developers to avoid live credentials.

## Decision
Keep `PAYMENTS_LIVE_ENABLED=false` by default and fail closed when the gate or provider configuration is invalid. Credential presence alone never enables live processing.

## Consequences
A launch checklist and environment review are required. Staging uses sandbox credentials. Deployment must verify that the intended environment and provider are selected.

## Security and operations
Before enabling, require documented provider approval, legal/compliance review, security review, webhook verification, reconciliation, support ownership, monitoring, backups, and incident procedures. Record the approving owner and date.