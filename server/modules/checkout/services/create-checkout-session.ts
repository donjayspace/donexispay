import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { CheckoutStatus, MerchantStatus, Prisma } from "@prisma/client";
import { env } from "@/server/infrastructure/config/env";
import { prisma } from "@/server/infrastructure/database/prisma";
import { decryptSensitiveValue, encryptSensitiveValue } from "@/server/infrastructure/crypto/secret-box";
import { AppError } from "@/server/shared/errors/app-error";
import type { CreateCheckoutSessionInput } from "@/server/modules/checkout/schemas/create-checkout-session";

const OPERATION = "checkout-session:create";
const SESSION_TTL_MS = 30 * 60 * 1000;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validateReturnUrl(value?: string): string | undefined {
  if (!value) return undefined;

  const target = new URL(value);
  const application = new URL(env.APP_URL);

  // Until merchant return-domain registration is implemented, only same-origin redirects are accepted.
  if (target.origin !== application.origin) {
    throw new AppError("VALIDATION_ERROR", "Return URLs must use the configured application origin.", 400);
  }

  if (env.NODE_ENV === "production" && target.protocol !== "https:") {
    throw new AppError("VALIDATION_ERROR", "Return URLs must use HTTPS in production.", 400);
  }

  return target.toString();
}

function decodeStoredResponse(payload: Prisma.JsonValue | null) {
  if (!payload || typeof payload !== "object" || !("encrypted" in payload)) {
    throw new AppError("INTERNAL_ERROR", "Stored idempotency response is unavailable.", 500, false);
  }

  const encrypted = (payload as { encrypted?: unknown }).encrypted;
  if (typeof encrypted !== "string") {
    throw new AppError("INTERNAL_ERROR", "Stored idempotency response is invalid.", 500, false);
  }

  return JSON.parse(decryptSensitiveValue(encrypted)) as CreateCheckoutSessionResult;
}

export interface CreateCheckoutSessionResult {
  id: string;
  status: CheckoutStatus;
  amountMinor: string;
  currency: string;
  expiresAt: string;
  checkoutUrl: string;
}

export async function createCheckoutSession(input: {
  merchantId: string;
  idempotencyKey: string;
  data: CreateCheckoutSessionInput;
}): Promise<{ result: CreateCheckoutSessionResult; replayed: boolean }> {
  const merchant = await prisma.merchant.findUnique({
    where: { id: input.merchantId },
    select: { id: true, status: true },
  });

  if (!merchant || merchant.status !== MerchantStatus.ACTIVE) {
    throw new AppError("FORBIDDEN", "Merchant is not permitted to create checkout sessions.", 403);
  }

  const requestHash = sha256(JSON.stringify(input.data));
  const existing = await prisma.idempotencyRecord.findUnique({
    where: {
      merchantId_operation_key: {
        merchantId: input.merchantId,
        operation: OPERATION,
        key: input.idempotencyKey,
      },
    },
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new AppError("CONFLICT", "Idempotency key was already used with a different request.", 409);
    }
    return { result: decodeStoredResponse(existing.responsePayload), replayed: true };
  }

  const amountMinor = BigInt(input.data.amountMinor);
  const successUrl = validateReturnUrl(input.data.successUrl);
  const cancelUrl = validateReturnUrl(input.data.cancelUrl);
  const rawCheckoutToken = randomBytes(32).toString("base64url");
  const checkoutTokenHash = sha256(rawCheckoutToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.checkoutSession.create({
        data: {
          merchantId: input.merchantId,
          orderReference: input.data.orderReference,
          amountMinor,
          currency: input.data.currency,
          description: input.data.description,
          checkoutTokenHash,
          expiresAt,
          successUrl,
          cancelUrl,
        },
        select: {
          id: true,
          status: true,
          amountMinor: true,
          currency: true,
          expiresAt: true,
        },
      });

      const response: CreateCheckoutSessionResult = {
        id: session.id,
        status: session.status,
        amountMinor: session.amountMinor.toString(),
        currency: session.currency,
        expiresAt: session.expiresAt.toISOString(),
        checkoutUrl: new URL(`/checkout/${rawCheckoutToken}`, env.APP_URL).toString(),
      };

      await tx.idempotencyRecord.create({
        data: {
          merchantId: input.merchantId,
          operation: OPERATION,
          key: input.idempotencyKey,
          requestHash,
          resourceId: session.id,
          responseCode: 201,
          // The one-time checkout URL is encrypted so idempotent retries can safely replay it.
          responsePayload: { encrypted: encryptSensitiveValue(JSON.stringify(response)) },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await tx.auditLog.create({
        data: {
          actorType: "API_KEY",
          actorId: input.merchantId,
          action: "checkout_session.created",
          targetType: "CheckoutSession",
          targetId: session.id,
          outcome: "SUCCESS",
          metadata: { currency: session.currency, amountMinor: session.amountMinor.toString() },
        },
      });

      return response;
    });

    return { result, replayed: false };
  } catch (error) {
    // A concurrent request may win the unique idempotency/order-reference constraint.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const replay = await prisma.idempotencyRecord.findUnique({
        where: {
          merchantId_operation_key: {
            merchantId: input.merchantId,
            operation: OPERATION,
            key: input.idempotencyKey,
          },
        },
      });

      if (replay) {
        if (replay.requestHash !== requestHash) {
          throw new AppError("CONFLICT", "Idempotency key was already used with a different request.", 409);
        }
        return { result: decodeStoredResponse(replay.responsePayload), replayed: true };
      }

      throw new AppError("CONFLICT", "A checkout session already exists for this merchant order reference.", 409);
    }

    throw error;
  }
}

export async function getCheckoutSessionByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) {
    throw new AppError("NOT_FOUND", "Checkout session was not found.", 404);
  }

  const session = await prisma.checkoutSession.findUnique({
    where: { checkoutTokenHash: sha256(token) },
    select: {
      id: true,
      status: true,
      amountMinor: true,
      currency: true,
      description: true,
      expiresAt: true,
      merchant: { select: { name: true } },
    },
  });

  if (!session) throw new AppError("NOT_FOUND", "Checkout session was not found.", 404);

  if (session.status === CheckoutStatus.OPEN && session.expiresAt <= new Date()) {
    await prisma.checkoutSession.updateMany({
      where: { id: session.id, status: CheckoutStatus.OPEN, expiresAt: { lte: new Date() } },
      data: { status: CheckoutStatus.EXPIRED },
    });
    return { ...session, status: CheckoutStatus.EXPIRED };
  }

  return session;
}
