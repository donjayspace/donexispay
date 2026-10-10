# DonexisPay Route Map and Wiring Guide

Route groups in parentheses are organizational only and do not appear in public URLs. This map reflects the current App Router files; verify against the repository tree when routes change.

## Public and customer identity routes
| URL | File | Access expectation |
|---|---|---|
| `/` | `src/app/(marketing)/page.tsx` | Public |
| `/login` | `src/app/(auth)/login/page.tsx` | Public customer sign-in |
| `/register` | `src/app/(auth)/register/page.tsx` | Public customer registration |
| `/checkout/[sessionId]` | `src/app/checkout/[sessionId]/page.tsx` | Opaque checkout session; validate token and expiry server-side |
| `/checkout/return` | `src/app/checkout/return/page.tsx` | Neutral provider-return page; never treats redirect as proof |
| `/checkout-link/[token]` | `src/app/checkout-link/[token]/page.tsx` | Public payment-link token; validate and expire |
| `/admin/login` | `src/app/admin/login/page.tsx` | Separate administrator login |

## Merchant workspace
The workspace layout is `src/app/(dashboard)/layout.tsx`. It must require a valid customer session. OAuth identities never grant admin access. Each page and every data mutation must also verify active merchant membership and the required permission.

| URL | File |
|---|---|
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` |
| `/dashboard/onboarding` | `src/app/(dashboard)/dashboard/onboarding/page.tsx` |
| `/dashboard/transactions` | `src/app/(dashboard)/dashboard/transactions/page.tsx` |
| `/dashboard/checkout` | `src/app/(dashboard)/dashboard/checkout/page.tsx` |
| `/dashboard/payment-links` | `src/app/(dashboard)/dashboard/payment-links/page.tsx` |
| `/dashboard/customers` | `src/app/(dashboard)/dashboard/customers/page.tsx` |
| `/dashboard/refunds` | `src/app/(dashboard)/dashboard/refunds/page.tsx` |
| `/dashboard/developers` | `src/app/(dashboard)/dashboard/developers/page.tsx` |
| `/dashboard/settings` | `src/app/(dashboard)/dashboard/settings/page.tsx` |

Shared navigation is implemented in `src/components/layouts/dashboard-shell.tsx`. Some dashboard screens may still be presentation/previews; verify service wiring before describing an action as production-ready.

## Administrator console
Console pages live under `src/app/admin/(console)/`; the shared layout is `src/app/admin/(console)/layout.tsx`. Navigation and active highlighting use `src/components/layouts/admin-shell.tsx` and `src/components/layouts/admin-navigation.tsx`.

| URL | Page file | Permission concept |
|---|---|---|
| `/admin` | `src/app/admin/(console)/page.tsx` | Overview |
| `/admin/merchants` | `src/app/admin/(console)/merchants/page.tsx` | Merchant operations |
| `/admin/payments` | `src/app/admin/(console)/payments/page.tsx` | Payment operations |
| `/admin/events` | `src/app/admin/(console)/events/page.tsx` | Provider event operations |
| `/admin/refunds` | `src/app/admin/(console)/refunds/page.tsx` | Refund operations |
| `/admin/settlements` | `src/app/admin/(console)/settlements/page.tsx` | Settlement operations |
| `/admin/reconciliation` | `src/app/admin/(console)/reconciliation/page.tsx` | Reconciliation |
| `/admin/risk` | `src/app/admin/(console)/risk/page.tsx` | Risk review |
| `/admin/billing` | `src/app/admin/(console)/billing/page.tsx` | Platform billing |
| `/admin/providers` | `src/app/admin/(console)/providers/page.tsx` | Provider configuration |
| `/admin/users` | `src/app/admin/(console)/users/page.tsx` | Customer user support |
| `/admin/administrators` | `src/app/admin/(console)/administrators/page.tsx` | Privileged administrator management |
| `/admin/audit` | `src/app/admin/(console)/audit/page.tsx` | Audit trail |
| `/admin/settings` | `src/app/admin/(console)/settings/page.tsx` | System settings |

**Authorization requirement:** verify actual server-side guards before release. Every privileged page, API, Server Action, and service mutation must call the appropriate permission check. Navigation filtering is only a usability feature and never an authorization boundary.

## API route files
| URL | Route file | Method(s) |
|---|---|---|
| `/api/health` | `src/app/api/health/route.ts` | GET |
| `/api/auth/[provider]` | `src/app/api/auth/[provider]/route.ts` | GET |
| `/api/auth/[provider]/callback` | `src/app/api/auth/[provider]/callback/route.ts` | GET |
| `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | POST |
| `/api/admin/auth/login` | `src/app/api/admin/auth/login/route.ts` | POST |
| `/api/admin/auth/logout` | `src/app/api/admin/auth/logout/route.ts` | POST |
| `/api/onboarding/merchant` | `src/app/api/onboarding/merchant/route.ts` | GET, POST |
| `/api/v1/checkout-sessions` | `src/app/api/v1/checkout-sessions/route.ts` | POST |
| `/api/v1/payments` | `src/app/api/v1/payments/route.ts` | POST |
| `/api/v1/payments/[paymentId]` | `src/app/api/v1/payments/[paymentId]/route.ts` | GET |
| `/api/v1/payment-links` | `src/app/api/v1/payment-links/route.ts` | GET, POST |
| `/api/v1/customers` | `src/app/api/v1/customers/route.ts` | GET, POST |
| `/api/v1/refunds` | `src/app/api/v1/refunds/route.ts` | GET, POST |
| `/api/webhooks/[provider]` | `src/app/api/webhooks/[provider]/route.ts` | POST |

## Route wiring checklist
When adding a page or endpoint, update the page/handler, its server-side auth and tenant checks, module service, validation schema, loading/error/empty states, navigation and active state, tests, and this route map together.

Use `next/link` for internal browser navigation. API endpoints remain HTTP requests. Do not create sibling dynamic directories with different parameter names at the same level (for example `[token]` and `[sessionId]`); Next.js treats them as conflicting routes. Keep provider return pages neutral: only verified provider events or authenticated provider status checks can confirm payment.
