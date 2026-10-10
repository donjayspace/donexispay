import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ApiKeyEnvironment, MerchantStatus } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export interface IssueMerchantApiKeyInput {
  merchantId: string;
  name: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
  expiresAt?: Date;
}

/**
 * Internal service only. Do not expose as an unauthenticated route.
 * The caller must already have verified an authorized administrator workflow.
 */
export async function issueMerchantApiKey(input: IssueMerchantApiKeyInput) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: input.merchantId },
    select: { id: true, status: true },
  });

  if (!merchant) throw new AppError("NOT_FOUND", "Merchant not found.", 404);
  if (merchant.status !== MerchantStatus.ACTIVE) {
    throw new AppError("CONFLICT", "API keys can only be issued to active merchants.", 409);
  }

  const publicKeyId = randomBytes(9).toString("hex");
  const secret = randomBytes(32).toString("base64url");
  const prefix = input.environment === ApiKeyEnvironment.LIVE ? "dpx_live" : "dpx_test";
  const rawKey = `${prefix}_${publicKeyId}.${secret}`;

  const record = await prisma.apiKey.create({
    data: {
      merchantId: input.merchantId,
      name: input.name.trim().slice(0, 80),
      keyPrefix: publicKeyId,
      secretHash: hashSecret(secret),
      environment: input.environment,
      scopes: input.scopes,
      expiresAt: input.expiresAt,
    },
    select: { id: true, name: true, environment: true, createdAt: true, expiresAt: true },
  });

  // Return rawKey only in this issuance response; never persist or log it.
  return { ...record, apiKey: rawKey };
}
