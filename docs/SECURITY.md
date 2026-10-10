# Security Engineering Guide

## Security baseline
Enforce security in server services and database queries, not only in UI or middleware. Use least privilege, explicit trust boundaries, and auditable privileged actions.

## Identity and authorization
- Customer OAuth is only for customer identities and must never grant admin access.
- Admin identities, password hashes, sessions, throttling, and roles are separate from customer OAuth.
- Protect every private page, Server Action, and API endpoint with server-side authorization.
- Derive merchant scope from authenticated API keys/session membership, not a submitted merchant ID alone.
- Require explicit role permissions for privileged admin operations at both page and mutation/service layers.
- Use Secure, HttpOnly, SameSite cookies in production; revoke sessions after sensitive events.

## Secrets and credentials
Never commit real credentials or expose them via `NEXT_PUBLIC_*`. Hash API keys; display newly created secrets once; support rotation/revocation. Use distinct secrets per environment and managed secret storage. Bootstrap the first administrator with the controlled script, then remove bootstrap variables.

## Request safety
Validate all untrusted input; cap body size, pagination, and request timeouts; rate-limit login and money-moving routes; protect cookie-authenticated mutations against CSRF; restrict CORS; set security headers; validate redirect URLs. Protect server-side outbound requests against SSRF, private IPs, metadata endpoints, DNS rebinding, and unsafe redirects.

## Payment data
Prefer provider-hosted checkout to minimize cardholder data exposure. Never store CVV or sensitive authentication data after authorization. Map data flows and confirm PCI scope with qualified parties; do not claim compliance certification without evidence.

## Webhooks
Verify signatures against the exact raw body where required, validate timestamps/replay protection, persist unique provider event IDs, and process idempotently. Never trust a payload only because it is valid JSON.

## Production checklist
- [ ] Secret/dependency scanning and security review completed.
- [ ] Customer, admin, API key, and cross-merchant isolation tests pass.
- [ ] Rate limits, session revocation, CSRF, headers, and webhook verification tested.
- [ ] Environment-specific secrets and rotation/revocation documented.
- [ ] Logs redact tokens, secrets, personal data, and raw provider payloads.
- [ ] Backup restoration and incident response exercised.
- [ ] Legal/privacy/security owners sign off on launch scope.
