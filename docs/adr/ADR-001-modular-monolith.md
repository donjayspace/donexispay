# ADR-001: Use a modular monolith

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
DonexisPay needs clear domain boundaries without the deployment and distributed-systems overhead of early microservices.

## Options considered
1. **Modular monolith:** one Next.js application and deployment, separated into business modules.
2. **Microservices from day one:** independent deployments, but higher operational, tracing, network, and consistency costs.
3. **Unstructured monolith:** initially simple but encourages coupling.

## Decision
Use Next.js App Router and TypeScript as a modular monolith. Keep business logic under `src/server/modules/`, technical infrastructure under `src/server/infrastructure/`, and transport handlers thin. Workers may run as separate processes if needed, while reusing module services.

## Consequences
The application is simpler to deploy and transact across modules. Module ownership and dependency rules must be enforced in reviews and tests. Extract a service only when scaling, isolation, or team ownership justifies it.

## Security and operations
Shared deployment does not justify shared authorization. Every module must enforce tenant boundaries and publish safe interfaces.