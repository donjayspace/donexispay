import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { ApiKeyEnvironment, MerchantStatus } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/server/shared/errors/app-error";

export interface MerchantApiPrincipal {
  merchantId: string;
  apiKeyId: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function constantTimeHashMatch(expectedHex: string, providedSecret: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = sha256(providedSecret);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * API keys use this format:
 * dpx_test_<public-key-id>.<secret>
 * dpx_live_<public-key-id>.<secret>
 *
 * Only a hash of the secret is stored. The full key must be shown only at issuance.
 */
export async function authenticateMerchantApiKey(
  authorizationHeader: string | null,
): Promise<MerchantApiPrincipal> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHENTICATED", "A valid API key is required.", 401);
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  const match = /^(dpx_(test|live)_([a-f0-9]{18}))\.([A-Za-z0-9_-]{40,})$/.exec(token);

  if (!match) {
    throw new AppError("UNAUTHENTICATED", "A valid API key is required.", 401);
  }

  const [, , mode, publicKeyId, secret] = match;
  const key = await prisma.apiKey.findUnique({
    where: { keyPrefix: publicKeyId },
    include: { merchant: { select: { id: true, status: true } } },
  });

  if (
    !key ||
    key.revokedAt ||
    (key.expiresAt && key.expiresAt <= new Date()) ||
    key.environment !== (mode === "live" ? ApiKeyEnvironment.LIVE : ApiKeyEnvironment.TEST) ||
    !constantTimeHashMatch(key.secretHash, secret)
  ) {
    throw new AppError("UNAUTHENTICATED", "A valid API key is required.", 401);
  }

  if (key.merchant.status !== MerchantStatus.ACTIVE) {
    throw new AppError("FORBIDDEN", "This merchant account is not enabled.", 403);
  }

  if (key.environment === ApiKeyEnvironment.LIVE && !env.PAYMENTS_LIVE_ENABLED) {
    throw new AppError("PAYMENTS_DISABLED", "Live API keys are disabled in this environment.", 503);
  }

  // Do not await last-used persistence on every request in a future high-volume implementation;
  // it may be moved to a durable asynchronous audit/update path after measuring load.
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    merchantId: key.merchantId,
    apiKeyId: key.id,
    environment: key.environment,
    scopes: key.scopes,
  };
}
