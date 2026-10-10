# Environment Configuration Guide

## Rules
- Copy `.env.example` to `.env.local` for local development.
- Never commit `.env.local`, production credentials, or populated environment dumps.
- Use different secrets and provider credentials for development, staging, and production.
- Do not prefix secrets with `NEXT_PUBLIC_`; that prefix exposes values to browser code.
- `src/lib/env.ts` is the runtime validation source. When adding/removing a variable, update the schema, `.env.example`, this guide, and deployment configuration in the same change.

## Core variables
| Variable | Required? | Purpose |
|---|---|---|
| `NODE_ENV` | Runtime default | `development`, `test`, or `production` |
| `APP_URL` | Recommended | Canonical application origin; must match deployed URL |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `APP_SECRET` | Yes | High-entropy application secret; unique per environment |
| `LOG_LEVEL` | Optional | Structured log threshold |
| `PAYMENTS_LIVE_ENABLED` | Default false | Explicit live-payment safety gate |

## Customer OAuth
Google and GitHub client IDs/secrets are optional until the provider is configured. Register the exact redirect URI shown in `.env.example` for local development and separate callback URLs for each deployed environment. These credentials are for customer OAuth only and must not be used for administrator login.

## Payment provider
The provider variables are placeholders until a provider is selected and approved. Configure sandbox credentials in development/staging. Keep live credentials out of local development. The application must fail closed when required provider configuration is absent, and a live gate must not be enabled merely because credentials exist.

## Administrator bootstrap
`ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, and `ADMIN_BOOTSTRAP_NAME` are temporary inputs for the bootstrap script. Use them only in a controlled secure environment, run the bootstrap operation, verify login, and remove the variables immediately. Do not use a shared/default password or keep bootstrap variables set for normal production runtime.

## Optional integrations
- Error monitoring: `SENTRY_DSN`.
- Queue/cache: `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Do not assume durable background processing exists merely because these are set.
- Email: `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY`, and SMTP settings.
- Object storage: `STORAGE_*` variables for S3-compatible storage. Do not store cardholder data in general-purpose object storage.

## Secret generation and rotation
Generate independent high-entropy secrets for each environment using a trusted local secret generator. Never reuse example values. If a secret is exposed, revoke/rotate it, inspect logs and audit events, assess potential data exposure, and follow the incident runbook.

## Deployment validation
Before deployment, verify every required variable exists, URLs use HTTPS in production, OAuth callbacks match exactly, database credentials are least-privilege, provider credentials match the intended environment, and live payments remain disabled until all launch gates are signed off.
