# Architecture Decision Records (ADR) Index

An ADR records context, options, the chosen decision, consequences, and status. Individual records live in [`docs/adr/`](./adr/README.md). Do not silently change an accepted decision; create a superseding ADR.

## Current decisions
| ID | Decision | Status |
|---|---|---|
| ADR-001 | Modular monolith with Next.js App Router | Accepted |
| ADR-002 | PostgreSQL and Prisma | Accepted |
| ADR-003 | Provider adapter boundary | Accepted |
| ADR-004 | Live payments disabled by default | Accepted |
| ADR-005 | Exact monetary representation | Accepted |
| ADR-006 | Durable idempotency | Accepted |
| ADR-007 | Redirect is not payment confirmation | Accepted |
| ADR-008 | Separate customer and admin identities | Accepted |
| ADR-009 | pnpm package manager | Accepted |
| ADR-010 | Webhook persistence and deduplication | Accepted |

## Workflow
1. Copy [the ADR template](./adr/ADR-TEMPLATE.md) and choose the next ID.
2. Record Proposed, Accepted, Rejected, Deprecated, or Superseded status and date.
3. Include context, options, decision, consequences, security/operations impact, and follow-up actions.
4. Request review from relevant engineering owners and security/finance/legal stakeholders as appropriate.
5. Link the ADR from affected guides and PRs; update this index when status changes.

An accepted ADR records intent; it does not prove the feature is implemented or compliance work is complete. Track implementation separately in the roadmap and release checklist.
