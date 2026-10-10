# API Conventions

## General
- Use versioned paths for stable public APIs when introduced, e.g. `/api/v1`.
- Use JSON request and response bodies.
- Validate every untrusted request with a schema.
- Keep route handlers thin and call services.
- Return a request/correlation ID where available.
- Never return stack traces, provider secrets, raw provider payloads, or internal database errors.

## Response format
Success responses should return a stable resource representation. Errors should use a consistent structure:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request did not pass validation.",
    "requestId": "optional-correlation-id"
  }
}
```

## Status codes
- 200: successful read or operation.
- 201: resource created.
- 202: accepted for asynchronous processing.
- 400: malformed or invalid request.
- 401: authentication required or invalid.
- 403: authenticated but not authorized.
- 404: resource not found or intentionally concealed.
- 409: idempotency or state conflict.
- 422: syntactically valid but semantically ineligible operation, if adopted consistently.
- 429: rate limit exceeded.
- 500: unexpected internal error.
- 503: required provider or operation temporarily unavailable.

## Idempotency
Financial create operations must accept an idempotency key. Scope it to merchant and operation; persist a request fingerprint; reject reuse with a different payload. A retry must return the existing operation/result or an explicit in-progress response, not create a second financial operation.

## Authentication and tenant isolation
Every protected route must authenticate the caller and derive merchant identity from verified credentials/session state—not a body field supplied by the client. All reads and writes must be scoped to that identity.

## Pagination
Use bounded pagination for list endpoints. Set maximum page size and stable ordering. Do not return unbounded transaction lists.

## Health
The current `GET /api/health` endpoint checks only that the application process responds. It does not indicate database, queue, or provider readiness.
