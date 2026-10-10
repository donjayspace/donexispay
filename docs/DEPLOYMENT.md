# Deployment and Release Guide

## Environments
Keep local, CI/test, staging, and production isolated. Each environment needs its own database, OAuth callback URLs, app secrets, API keys, provider credentials, webhook secrets, storage, and logs. Never copy production personal data or live credentials into staging.

## CI gates
For every pull request run frozen-lockfile install, Prisma generation/schema validation, typecheck, lint, tests, secret/dependency scanning, and production build. Use least-privilege CI credentials; untrusted PRs must not access production secrets.

## Release procedure
1. Review code and migration diffs.
2. Run `pnpm install --frozen-lockfile`, database generation, typecheck, lint, tests, and build.
3. Deploy an immutable commit/artifact to staging.
4. Apply backward-compatible migrations and run smoke tests.
5. Obtain release approval and deploy the same artifact to production.
6. Apply committed migrations through `pnpm run db:deploy` as a controlled step coordinated with the hosting model.
7. Verify health, login, admin authorization, webhook delivery, and intended payment gate.
8. Monitor errors, latency, provider outcomes, and unknown-payment backlog.

## Secrets and callbacks
Use hosting secret storage or a managed secret service. Validate required configuration at startup. Register exact OAuth callback URLs per environment. Never log environment values. Rotate compromised secrets immediately and plan staged rotation when supported.

## Database and rollback
Use expand/backfill/contract for breaking changes. Take verified backups before risky migrations. Never use `prisma migrate dev` in production. Application rollback may not reverse schema changes; prefer forward fixes and preserve confirmed financial events. Reconcile if a release affected payment state.

## Live launch gate
Keep `PAYMENTS_LIVE_ENABLED=false` until provider approval, production credentials, webhook registration, security/legal review, reconciliation, support escalation, alerting, tested backups, and incident/rollback procedures are complete.
