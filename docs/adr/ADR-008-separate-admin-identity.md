# ADR-008: Separate customer and administrator identity systems

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Customer registration and social OAuth have different trust requirements from privileged operational access.

## Decision
Customer OAuth creates or authenticates customer users only. Administrator identities, password hashes, sessions, login throttling, and role permissions are managed separately. Customer role claims must never grant admin-console access.

## Consequences
There are separate login/logout flows and authorization tests. Administrator provisioning must be controlled and audited.

## Security and operations
Require server-side permission checks on every privileged page and mutation, secure cookies, session revocation, brute-force controls, audit logging, and periodic administrator access review.