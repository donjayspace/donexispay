# ADR-009: Use pnpm as the package manager

- **Status:** Accepted
- **Date:** 2026-10-10

## Context
Multiple package managers can produce competing lockfiles and inconsistent dependency resolution across developer machines and CI.

## Decision
Use the pnpm version declared in `package.json` and commit `pnpm-lock.yaml`. CI installs with `pnpm install --frozen-lockfile`. Do not commit `package-lock.json` or Bun lockfiles for this repository unless this ADR is superseded.

## Consequences
Developers must use the documented pnpm version. Dependency changes update the lockfile in the same change.

## Security and operations
Review dependency changes, run vulnerability/secret scanning, and avoid installing unpinned tools globally in CI.