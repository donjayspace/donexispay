import "server-only";
import { z } from "zod";

/**
 * Validate required runtime configuration once, on the server.
 * Provider credentials remain optional until a provider is selected and approved.
 * Never add secrets to NEXT_PUBLIC_* variables.
 */
const optionalSecret = z.string().optional().default("");

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  PAYMENTS_LIVE_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),

  // Customer OAuth only; these credentials never grant admin-console access.
  GOOGLE_CLIENT_ID: optionalSecret,
  GOOGLE_CLIENT_SECRET: optionalSecret,
  GITHUB_CLIENT_ID: optionalSecret,
  GITHUB_CLIENT_SECRET: optionalSecret,

  // Provider-agnostic payment configuration. Populate only after provider approval.
  PAYMENT_PROVIDER_NAME: optionalSecret,
  PAYMENT_PROVIDER_BASE_URL: z.string().url().optional().or(z.literal("")),
  PAYMENT_PROVIDER_API_KEY: optionalSecret,
  PAYMENT_PROVIDER_API_SECRET: optionalSecret,
  PAYMENT_PROVIDER_WEBHOOK_SECRET: optionalSecret,
  PAYMENT_PROVIDER_MERCHANT_ID: optionalSecret,

  // Optional observability, queue/cache, and outbound email integrations.
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  REDIS_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: optionalSecret,
  EMAIL_PROVIDER: z.enum(["none", "resend", "smtp"]).default("none"),
  EMAIL_FROM: z.string().optional().default(""),
  RESEND_API_KEY: optionalSecret,
  SMTP_HOST: optionalSecret,
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: optionalSecret,
  SMTP_PASSWORD: optionalSecret,

  // Optional Cloudflare R2/S3-compatible object storage; never use for card data.
  STORAGE_ENDPOINT: z.string().url().optional().or(z.literal("")),
  STORAGE_REGION: z.string().optional().default("auto"),
  STORAGE_BUCKET: optionalSecret,
  STORAGE_ACCESS_KEY_ID: optionalSecret,
  STORAGE_SECRET_ACCESS_KEY: optionalSecret,
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),

  // Used only by scripts/bootstrap-admin.mjs during first-admin provisioning.
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional().or(z.literal("")),
  ADMIN_BOOTSTRAP_PASSWORD: optionalSecret,
  ADMIN_BOOTSTRAP_NAME: z.string().optional().default(""),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  // Report invalid variable names only; values can contain secrets.
  const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid server environment configuration: ${keys}`);
}

export const env = parsed.data;
