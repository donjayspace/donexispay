# Payment Flows and Lifecycles

## Checkout creation
1. Authenticate merchant.
2. Validate merchant status and permission.
3. Validate order reference, positive amount, supported currency, allowed return URLs, and expiry.
4. Persist a checkout session with a server-generated identifier.
5. Return a hosted checkout URL that does not expose provider secrets.

## Payment initiation
1. Validate session ownership, status, and expiry.
2. Enforce idempotency.
3. Persist payment and attempt records.
4. Call the provider adapter outside a long-running DB transaction.
5. Persist provider reference and normalized response.
6. Return only safe next-step information.
7. Resolve the final status from authoritative provider information.

## Payment states
Suggested states: CREATED, REQUIRES_ACTION, PROCESSING, SUCCEEDED, FAILED, CANCELED, EXPIRED, REQUIRES_REVIEW. Define allowed transitions centrally. Terminal states cannot be casually reversed. Unknown provider outcomes must be represented as unresolved/reviewable rather than falsely marked failed.

## Refunds
1. Authenticate and authorize the actor.
2. Verify the original payment is eligible.
3. Atomically protect the remaining refundable amount.
4. Create an idempotent refund operation.
5. Submit through the provider adapter.
6. Persist provider reference and response.
7. Confirm completion using authoritative provider data.
8. Audit and reconcile the result.

## Failure handling
- A timeout does not prove that the provider did not execute the operation.
- Do not blindly retry through a second provider while the original outcome is unknown.
- Retry only when provider idempotency and operation semantics make it safe.
- Store correlation IDs and provider references for investigations.

## Fulfillment
A merchant must query the authoritative payment status or verify a signed server-to-server event before fulfilling an order. A customer redirect alone is never sufficient.
