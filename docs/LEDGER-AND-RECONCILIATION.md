# Ledger and Reconciliation Guide

## Scope
An orchestration platform still needs auditable payment records and reconciliation. A full double-entry ledger becomes necessary if the approved operating model creates balances, payables/receivables, fees, settlement obligations, or funds-handling responsibilities. Do not create wallet-like balances by summing payment rows.

## Financial record principles
- Preserve payment/refund lifecycle history and source references.
- Correct completed events with compensating/reversal records rather than rewriting history.
- Each financial event needs stable IDs, provider reference, currency, exact amount, timestamp, and source.
- Separate gross amount, provider fees, platform fees, refunds, disputes, and net settlement.
- Never sum different currencies without an explicit conversion record and rate source.
- If a ledger is introduced, use immutable journal entries and enforce balanced postings.

## Reconciliation inputs
Match internal payment/refund records against provider transaction APIs/exports, settlement reports, fees, refunds, disputes, and bank/settlement statements where applicable. Record report source, period, retrieval time, checksum/reference, and import outcome.

## Matching and exception handling
Match exact provider reference and currency/amount first. Categorize missing internal record, missing provider record, amount/currency mismatch, duplicate row, timing difference, fee discrepancy, and settlement shortfall. Ambiguous differences must not be silently auto-resolved.

## Workflow
1. Import provider data idempotently.
2. Normalize rows while retaining source references.
3. Match records and produce exceptions.
4. Assign owner and target resolution date.
5. Record investigation, evidence, adjustment/reversal, reviewer, and outcome.
6. Produce period reports and retain according to approved policy.

## Launch gate
Before live funds flow, define settlement responsibility, accounting ownership, reconciliation frequency, exception SLA, approval thresholds, refund/chargeback accounting, and reporting with finance/legal stakeholders.
