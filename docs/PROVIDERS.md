# Payment Provider Integrations

## Selection gate
Choose a provider only after confirming supported business model, countries, currencies, methods, merchant categories, settlement model, refunds, disputes, webhook behavior, and commercial/legal requirements. Do not enable live payments before provider approval.

## Adapter responsibilities
Each adapter translates internal requests into provider-specific API calls and normalizes responses. It should expose explicit capabilities, timeouts, safe error classification, idempotency behavior, payment status retrieval, refunds where supported, and webhook verification.

## Provider interface
The initial contract is in `server/modules/providers/types/payment-provider.ts`. Extend it deliberately as provider requirements become clear. Provider-specific SDK types should not leak into checkout and payment domain models.

## Required behavior
- Use provider idempotency support where available.
- Set bounded request timeouts.
- Distinguish declines, validation errors, transient failures, and unknown outcomes.
- Never log authorization headers, secrets, raw payment credentials, or unnecessary personal data.
- Validate amount and currency constraints before sending.
- Store provider references and safe diagnostic metadata.
- Do not trust browser return parameters as payment confirmation.

## Testing
Use provider sandbox credentials and documented test scenarios. Test duplicate requests, timeouts, delayed events, out-of-order webhooks, declines, refunds, and provider outages. Tests must not trigger live transactions.

## Configuration
Provider secrets belong in a secret manager or protected environment configuration. Separate sandbox and production credentials. Keep live payment execution disabled until security and operational gates pass.
