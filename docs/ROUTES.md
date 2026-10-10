# DonexisPay Route Map

This document is the source-of-truth map between browser URLs, App Router page files, and the shared navigation components. Route groups such as `(marketing)`, `(auth)`, and `(dashboard)` organize code but are not included in public URLs.

## Public pages

| URL | App Router file | Purpose |
|---|---|---|
| `/` | `src/app/(marketing)/page.tsx` | Marketing homepage and entry links |
| `/login` | `src/app/(auth)/login/page.tsx` | Customer OAuth sign-in |
| `/register` | `src/app/(auth)/register/page.tsx` | Customer OAuth registration |
| `/checkout/[sessionId]` | `src/app/checkout/[sessionId]/page.tsx` | Hosted checkout session, resolved by its opaque checkout token |
| `/checkout/return` | `src/app/checkout/return/page.tsx` | Neutral provider-return landing page; never treats a browser redirect as payment proof |
| `/checkout-link/[token]` | `src/app/checkout-link/[token]/page.tsx` | Resolves a public payment-link token into a short-lived checkout session |
| `/admin/login` | `src/app/admin/login/page.tsx` | Separate administrator credential login |

## Customer workspace pages

The route group `src/app/(dashboard)/` is protected by `src/app/(dashboard)/layout.tsx`, which calls `requireUser()`. Customer OAuth identities do not grant administrator access.

| URL | Page file | Navigation label |
|---|---|---|
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | Overview |
| `/dashboard/onboarding` | `src/app/(dashboard)/dashboard/onboarding/page.tsx` | Getting started |
| `/dashboard/transactions` | `src/app/(dashboard)/dashboard/transactions/page.tsx` | Transactions |
| `/dashboard/checkout` | `src/app/(dashboard)/dashboard/checkout/page.tsx` | Checkout |
| `/dashboard/payment-links` | `src/app/(dashboard)/dashboard/payment-links/page.tsx` | Payment links |
| `/dashboard/customers` | `src/app/(dashboard)/dashboard/customers/page.tsx` | Customers |
| `/dashboard/refunds` | `src/app/(dashboard)/dashboard/refunds/page.tsx` | Refunds |
| `/dashboard/developers` | `src/app/(dashboard)/dashboard/developers/page.tsx` | Developers |
| `/dashboard/settings` | `src/app/(dashboard)/dashboard/settings/page.tsx` | Settings |

Shared navigation is implemented in `src/components/layouts/dashboard-shell.tsx`. The workspace pages use `src/components/layouts/workspace-placeholder.tsx` for consistent responsive layout where the relevant dashboard actions are not yet enabled.

## Administrator console pages

Every route below is wrapped by `src/app/admin/(console)/layout.tsx`, which calls `requireAdmin()`. Each page additionally calls `requireAdminPermission()`. Navigation visibility is filtered on the server and the current URL is highlighted by `src/components/layouts/admin-navigation.tsx`.

| URL | Page file | Required permission |
|---|---|---|
| `/admin` | `src/app/admin/(console)/page.tsx` | `overview` |
| `/admin/merchants` | `src/app/admin/(console)/merchants/page.tsx` | `merchants` |
| `/admin/payments` | `src/app/admin/(console)/payments/page.tsx` | `payments` |
| `/admin/events` | `src/app/admin/(console)/events/page.tsx` | `events` |
| `/admin/refunds` | `src/app/admin/(console)/refunds/page.tsx` | `refunds` |
| `/admin/settlements` | `src/app/admin/(console)/settlements/page.tsx` | `settlements` |
| `/admin/reconciliation` | `src/app/admin/(console)/reconciliation/page.tsx` | `reconciliation` |
| `/admin/risk` | `src/app/admin/(console)/risk/page.tsx` | `risk` |
| `/admin/billing` | `src/app/admin/(console)/billing/page.tsx` | `billing` |
| `/admin/providers` | `src/app/admin/(console)/providers/page.tsx` | `providers` |
| `/admin/users` | `src/app/admin/(console)/users/page.tsx` | `users` |
| `/admin/administrators` | `src/app/admin/(console)/administrators/page.tsx` | `administrators` |
| `/admin/audit` | `src/app/admin/(console)/audit/page.tsx` | `audit` |
| `/admin/settings` | `src/app/admin/(console)/settings/page.tsx` | `settings` |

The administrator shell lives in `src/components/layouts/admin-shell.tsx`. Do not add a link to a privileged page without adding its permission and server-side guard.

## API routes

| URL | Route file | Method(s) | Purpose |
|---|---|---|---|
| `/api/health` | `src/app/api/health/route.ts` | GET | Process health only; not a provider or database readiness check |
| `/api/auth/[provider]` | `src/app/api/auth/[provider]/route.ts` | GET | Begin customer OAuth |
| `/api/auth/[provider]/callback` | `src/app/api/auth/[provider]/callback/route.ts` | GET | Verify OAuth callback and establish customer session |
| `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | POST | Revoke customer session |
| `/api/admin/auth/login` | `src/app/api/admin/auth/login/route.ts` | POST | Separate administrator sign-in |
| `/api/admin/auth/logout` | `src/app/api/admin/auth/logout/route.ts` | POST | Revoke administrator session |
| `/api/onboarding/merchant` | `src/app/api/onboarding/merchant/route.ts` | GET, POST | List/create merchant workspaces for the signed-in customer |
| `/api/v1/checkout-sessions` | `src/app/api/v1/checkout-sessions/route.ts` | POST | Create an idempotent hosted checkout session using merchant API credentials |
| `/api/v1/payments` | `src/app/api/v1/payments/route.ts` | POST | Start a provider payment attempt |
| `/api/v1/payments/[paymentId]` | `src/app/api/v1/payments/[paymentId]/route.ts` | GET | Read a payment scoped to the authenticated merchant |
| `/api/v1/payment-links` | `src/app/api/v1/payment-links/route.ts` | GET, POST | List/create merchant payment links |
| `/api/v1/customers` | `src/app/api/v1/customers/route.ts` | GET, POST | List/create merchant-scoped customer records |
| `/api/v1/refunds` | `src/app/api/v1/refunds/route.ts` | GET, POST | List/request merchant-scoped refunds |
| `/api/webhooks/[provider]` | `src/app/api/webhooks/[provider]/route.ts` | POST | Accept events only from a registered signature-verifying provider adapter |

## Navigation and routing rules

1. Use `next/link` for internal browser navigation. Keep provider callback and API endpoints as normal HTTP endpoints.
2. A route group name in parentheses is omitted from the URL.
3. Do not create multiple dynamic segment names at the same directory level (for example, both `[token]` and `[sessionId]` under `src/app/checkout/`). Next.js treats those as a conflicting route. Use one dynamic segment and name the parameter according to its meaning.
4. Keep the provider-return page neutral. A return URL is not proof of success; only verified provider state may update payment status.
5. A hidden navigation link is not authorization. Every private page and API handler must enforce authentication, merchant scoping, and/or the required administrator permission on the server.
6. When adding a page, update the relevant shell navigation, active-state behavior, this route map, and route-level authorization together.
7. Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` after route changes.
