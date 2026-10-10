# API Design and Integration Guide

## Conventions
Merchant APIs use versioned paths under `/api/v1`. Use JSON, schema validation, safe errors, and a request/correlation ID. Route handlers authenticate, validate, invoke a module service, and map a safe response. Never expose stack traces, SQL errors, secrets, or raw provider payloads.

## Authentication and tenant isolation
Use dedicated merchant API keys in the Authorization header. Store a hash, use a non-secret lookup prefix, enforce environment and scopes, and support expiry/revocation. Customer sessions and admin sessions are not substitutes for merchant API credentials. Every read/write must be scoped to the authenticated merchant.

## Idempotency
Payment-affecting POST requests require an `Idempotency-Key`. Scope it by merchant and operation and store a request fingerprint. Same key + same payload replays the original result; same key + different payload returns conflict. A database uniqueness constraint arbitrates concurrent requests. Do not expire keys while an operation can still be unresolved.

## Response design
Return stable resource IDs, status, amount in minor units as a decimal string, currency, timestamps, and next action when applicable. BigInt must be stringified. Errors should include a stable code, safe message, request ID, and safe field errors where appropriate.

Suggested HTTP statuses: 200 read/replay, 201 created, 202 pending provider operation, 400 invalid input, 401 invalid credentials, 403 insufficient scope, 404 missing or not visible to this merchant, 409 idempotency/state conflict, 422 business rule violation, 429 rate limited, 500 unexpected failure, 502/503 upstream unavailable.

## Pagination and filtering
Use bounded page sizes, stable cursor pagination for large lists, allowlisted sort fields, and explicit filters. Never accept arbitrary Prisma field names from request parameters.

## URL and webhook safety
Validate return URLs against an explicit policy to prevent open redirects. Verify inbound provider webhooks using provider-specific rules. Sign outbound merchant webhooks with endpoint secrets and include event IDs/timestamps. Protect server-side outbound requests against SSRF.

## Versioning
Additive optional fields are generally compatible; removing fields or changing status semantics requires versioning/deprecation. Document scopes, retries, idempotency, and sandbox/live behavior before publishing an endpoint.

## Endpoint release checklist
- [ ] Request/response schema and error codes documented.
- [ ] Authentication, scope, tenant isolation, rate limits, and audit reviewed.
- [ ] Duplicate/concurrent request behavior defined.
- [ ] Tests cover validation, authorization, retries, and provider uncertainty.
- [ ] Documentation matches the route's actual implementation.
