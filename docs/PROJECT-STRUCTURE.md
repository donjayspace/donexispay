# Project Structure

```text
donexispay/
├── app/
│   ├── api/
│   │   ├── health/route.ts
│   │   └── v1/checkout-sessions/route.ts
│   ├── checkout/[token]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── docs/
├── prisma/schema.prisma
├── server/
│   ├── infrastructure/
│   │   ├── config/env.ts
│   │   ├── crypto/secret-box.ts
│   │   ├── database/prisma.ts
│   │   └── http/api-response.ts
│   ├── modules/
│   │   ├── auth/api-key.ts
│   │   ├── auth/api-key-issue.ts
│   │   ├── checkout/schemas/
│   │   ├── checkout/services/
│   │   ├── payments/domain/
│   │   ├── payments/services/
│   │   └── providers/types/
│   └── shared/errors/app-error.ts
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Ownership rules
- `app/`: pages and thin HTTP route handlers.
- `server/modules/`: business rules and use cases.
- `server/infrastructure/`: technical adapters and shared infrastructure.
- `prisma/`: schema and migration history.
- `docs/`: product, architecture, security, and operational documentation.

The directory tree evolves as real features are implemented; avoid empty placeholder files.
