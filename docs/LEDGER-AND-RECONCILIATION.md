# Ledger and Reconciliation

## Scope decision
Whether DonexisPay needs a full double-entry ledger depends on the approved operating model. A platform that only orchestrates provider payments still needs auditable transaction records and reconciliation; balance, payable, receivable, settlement, or funds-handling features require a carefully designed accounting model and appropriate legal review.

## Ledger principles when implemented
- Use immutable journal entries; correct errors with reversing/adjusting entries.
- Each journal must balance by currency.
- Never combine different currencies in a journal without an explicit FX model.
- Link entries to the originating payment, refund, fee, settlement, or adjustment.
- Store actor, timestamp, source reference, and reason.
- Enforce posting rules in a domain service and database transaction.
- Avoid deriving financial truth solely from mutable status fields.

## Reconciliation
Compare internal records against provider transaction exports/API results and settlement reports where available. Match on provider references, amount, currency, status, and relevant timestamps.

Classify exceptions such as:
- Provider record missing internally.
- Internal payment missing at provider.
- Amount/currency mismatch.
- Status mismatch.
- Duplicate provider reference.
- Refund mismatch.
- Settlement discrepancy.
- Unresolved/late provider response.

## Resolution
Every exception must have an owner, status, evidence, and resolution note. Corrections must be auditable. Never silently rewrite historical financial records to force a match.

## MVP
Start with payment/provider references and a controlled exception workflow. Add automated matching and a formal ledger after the business model and accounting responsibilities are confirmed.
