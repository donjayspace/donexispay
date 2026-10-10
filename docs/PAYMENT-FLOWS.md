# Payment Flows and Lifecycles

## Checkout creation
1. Authenticate the merchant key and verify scope, environment, and merchant eligibility.
2. Validate amount, currency, order reference, expiry, and success/cancel URLs against policy.
3. Generate an opaque checkout token and store a hash where practical.
4. Persist the session and idempotency response in a short transaction.
5. Return a hosted checkout URL without provider credentials.

## Payment initiation
1. Load the session and verify ownership, expiry, status, amount, and currency.
2. Apply idempotency and check for an unresolved active attempt that could create a duplicate charge.
3. Persist payment and attempt records; commit before network I/O.
4. Submit to the approved provider with a stable idempotency reference.
5. Normalize the response and persist the mapped status.
6. If outcome is ambiguous, record UNKNOWN/REQUIRES_REVIEW and reconcile before retrying.

## Suggested states
Checkout: OPEN → PROCESSING → COMPLETED, CANCELED, EXPIRED.
Payment: CREATED → REQUIRES_ACTION / PROCESSING → SUCCEEDED, FAILED, CANCELED, EXPIRED, REQUIRES_REVIEW.
Attempt: CREATED → SUBMITTED → PROCESSING → SUCCEEDED / FAILED / UNKNOWN.
Only allow documented transitions. A late failure event must not downgrade a confirmed success; conflicting evidence requires provider lookup or manual review.

## Confirmation and fulfillment
The return page is navigation only. Confirm success from a verified provider webhook or authenticated provider status query, persisted server-side. Fulfillment notifications must be idempotent and happen only after authoritative success. Never trust query parameters or browser state as payment proof.

## Refunds
Verify merchant ownership, original payment status, remaining refundable amount, provider capability, and idempotency. Persist the request before provider I/O; support pending/unknown states. Multiple partial refunds must not exceed the captured amount. Acceptance of a refund request does not mean the refund is complete.

## Failure and recovery
Distinguish validation errors, provider rejection, timeout, outage, duplicate request, and uncertain outcome. Retry only documented idempotent operations. Reconcile unresolved attempts and expose safe trace IDs, provider references, timestamps, and controlled resolution actions to operations.
