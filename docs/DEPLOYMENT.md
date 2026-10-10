# Deployment

## Environments
Maintain separate development, staging/test, and production environments with separate database credentials, API secrets, provider credentials, webhook endpoints, and logs.

## Build and release
1. Review code and migration changes.
2. Run `npm ci`.
3. Run `npm run db:generate`.
4. Run `npm run typecheck` and `npm run lint`.
5. Run automated tests when the suite is added.
6. Build with `npm run build`.
7. Apply reviewed migrations using `npm run db:deploy`.
8. Deploy application and worker processes.
9. Verify health, database connectivity, webhook reachability, and alerts.
10. Monitor error rates and payment status resolution after release.

## Migrations
Do not run destructive development migration commands against production. Use reviewed migration files and a deployment process that can stop safely on failure. Prefer backward-compatible schema changes.

## Secrets
Use the deployment platform's secret manager or protected environment settings. Never place production secrets in repository files or client-exposed variables.

## Rollback
Application rollback does not necessarily roll back database schema safely. Define compatible schema transitions and corrective migrations. Preserve payment records and provider references during rollback.

## Readiness
Before enabling live payments, confirm provider approval, legal/compliance review, security assessment, monitoring, support procedures, tested backups, incident response, and a controlled rollout plan.
