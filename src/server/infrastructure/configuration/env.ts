import "server-only";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  PAYMENTS_LIVE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  // Do not print environment values; validation output only identifies invalid keys.
  const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid server environment configuration: ${keys}`);
}

export const env = parsed.data;
