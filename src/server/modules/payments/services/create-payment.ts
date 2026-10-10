import "server-only";
import { ApiKeyEnvironment, CheckoutStatus, MerchantStatus, PaymentAttemptStatus, PaymentStatus, Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";
import { assertPaymentTransition } from "@/server/modules/payments/domain/payment-state";
import { paymentProviderRegistry } from "@/server/modules/providers/registry";

export type CreatePaymentInput = {
  merchantId: string;
  environment: ApiKeyEnvironment;
  checkoutSessionId: string;
  providerId: string;
  idempotencyKey: string;
};

function mapProviderStatus(status: string): PaymentStatus {
  switch (status) {
    case "SUCCEEDED": return PaymentStatus.SUCCEEDED;
    case "FAILED": return PaymentStatus.FAILED;
    case "CANCELED": return PaymentStatus.CANCELED;
    case "REQUIRES_ACTION": return PaymentStatus.REQUIRES_ACTION;
    case "PENDING": return PaymentStatus.PROCESSING;
    default: return PaymentStatus.REQUIRES_REVIEW;
  }
}

function safeProviderRedirect(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    // Adapter output is trusted code, but its redirect must still be HTTPS and credential-free.
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Starts a provider attempt without holding a database transaction over network I/O.
 * Any ambiguous provider error is recorded as REQUIRES_REVIEW rather than FAILED,
 * because a timeout cannot prove that the provider did not create the payment.
 */
export async function createPayment(input: CreatePaymentInput) {
  if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 200) {
    throw new AppError("VALIDATION_ERROR", "A valid idempotency key is required.", 400);
  }
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(input.providerId)) {
    throw new AppError("VALIDATION_ERROR", "Invalid provider identifier.", 400);
  }
  if (input.environment === ApiKeyEnvironment.LIVE && !env.PAYMENTS_LIVE_ENABLED) {
    throw new AppError("PAYMENTS_DISABLED", "Live payment execution is disabled in this environment.", 503);
  }

  const [merchant, checkout, configuration] = await Promise.all([
    prisma.merchant.findUnique({ where: { id: input.merchantId }, select: { id: true, status: true } }),
    prisma.checkoutSession.findFirst({ where: { id: input.checkoutSessionId, merchantId: input.merchantId } }),
    prisma.providerConfiguration.findUnique({ where: { providerId_environment: { providerId: input.providerId, environment: input.environment } } }),
  ]);
  if (!merchant || merchant.status !== MerchantStatus.ACTIVE) throw new AppError("FORBIDDEN", "Merchant is not enabled.", 403);
  if (!checkout) throw new AppError("NOT_FOUND", "Checkout session not found for this merchant.", 404);
  if (!configuration || !configuration.enabled) throw new AppError("PROVIDER_ERROR", "Provider is not enabled for this environment.", 503);
  const provider = paymentProviderRegistry.get(input.providerId);
  if (!provider) throw new AppError("PROVIDER_ERROR", "Provider adapter is not registered.", 503);
  if (checkout.expiresAt <= new Date() || checkout.status === CheckoutStatus.EXPIRED) throw new AppError("CONFLICT", "Checkout session has expired.", 409);
  if (checkout.status === CheckoutStatus.COMPLETED || checkout.status === CheckoutStatus.CANCELED) throw new AppError("CONFLICT", "Checkout session is no longer payable.", 409);

  // Namespace the key by merchant to avoid collisions across independent merchant accounts.
  const providerIdempotencyKey = `${input.merchantId}:${input.idempotencyKey}`;
  const previousAttempt = await prisma.paymentAttempt.findUnique({
    where: { providerId_idempotencyKey: { providerId: input.providerId, idempotencyKey: providerIdempotencyKey } },
    include: { payment: true },
  });
  if (previousAttempt) {
    return {
      payment: previousAttempt.payment,
      providerRedirectUrl: previousAttempt.payment.providerRedirectUrl,
      replayed: true,
      uncertain: previousAttempt.status === PaymentAttemptStatus.UNKNOWN,
    };
  }

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        merchantId: input.merchantId,
        checkoutSessionId: checkout.id,
        amountMinor: checkout.amountMinor,
        currency: checkout.currency,
        providerId: input.providerId,
        status: PaymentStatus.CREATED,
      },
    });
    await tx.paymentAttempt.create({
      data: {
        paymentId: created.id,
        providerId: input.providerId,
        idempotencyKey: providerIdempotencyKey,
        status: PaymentAttemptStatus.CREATED,
      },
    });
    await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: CheckoutStatus.PROCESSING } });
    await tx.auditLog.create({
      data: { actorType: "MERCHANT_API", actorId: input.merchantId, action: "PAYMENT_ATTEMPT_CREATED", targetType: "PAYMENT", targetId: created.id, outcome: "SUCCESS", metadata: { providerId: input.providerId, environment: input.environment } },
    });
    return created;
  });

  try {
    const result = await provider.createPayment({
      internalPaymentId: payment.id,
      merchantReference: checkout.orderReference,
      amountMinor: checkout.amountMinor,
      currency: checkout.currency,
      returnUrl: checkout.successUrl ?? new URL("/checkout/return", env.APP_URL).toString(),
      cancelUrl: checkout.cancelUrl ?? undefined,
      idempotencyKey: providerIdempotencyKey,
    });
    const nextStatus = mapProviderStatus(result.status);
    const redirectUrl = safeProviderRedirect(result.checkoutUrl);

    if (result.checkoutUrl && !redirectUrl) {
      throw new Error("Provider returned a non-HTTPS or invalid redirect URL.");
    }

    assertPaymentTransition(PaymentStatus.CREATED, nextStatus);
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          providerPaymentId: result.providerPaymentId,
          providerRedirectUrl: redirectUrl,
          completedAt: nextStatus === PaymentStatus.SUCCEEDED ? new Date() : null,
        },
      });
      await tx.paymentAttempt.update({
        where: { providerId_idempotencyKey: { providerId: input.providerId, idempotencyKey: providerIdempotencyKey } },
        data: {
          providerPaymentId: result.providerPaymentId,
          requestReference: result.requestReference,
          status: nextStatus === PaymentStatus.SUCCEEDED ? PaymentAttemptStatus.SUCCEEDED
            : nextStatus === PaymentStatus.FAILED || nextStatus === PaymentStatus.CANCELED ? PaymentAttemptStatus.FAILED
            : nextStatus === PaymentStatus.REQUIRES_REVIEW ? PaymentAttemptStatus.UNKNOWN
            : PaymentAttemptStatus.PROCESSING,
        },
      });
      if (nextStatus === PaymentStatus.SUCCEEDED) {
        await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: CheckoutStatus.COMPLETED } });
      } else if (nextStatus === PaymentStatus.CANCELED) {
        await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: CheckoutStatus.CANCELED } });
      }
      await tx.auditLog.create({
        data: { actorType: "SYSTEM", action: "PAYMENT_PROVIDER_RESULT", targetType: "PAYMENT", targetId: payment.id, outcome: nextStatus === PaymentStatus.REQUIRES_REVIEW ? "REVIEW" : "SUCCESS", metadata: { providerId: input.providerId, status: nextStatus } },
      });
      return changed;
    });

    return { payment: updated, providerRedirectUrl: redirectUrl, replayed: false, uncertain: nextStatus === PaymentStatus.REQUIRES_REVIEW };
  } catch (error) {
    // Do not automatically retry a network call whose remote outcome is unknown.
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REQUIRES_REVIEW, failureCode: "PROVIDER_OUTCOME_UNKNOWN" } });
      await tx.paymentAttempt.update({
        where: { providerId_idempotencyKey: { providerId: input.providerId, idempotencyKey: providerIdempotencyKey } },
        data: { status: PaymentAttemptStatus.UNKNOWN, errorCode: "PROVIDER_OUTCOME_UNKNOWN" },
      });
      await tx.auditLog.create({
        data: { actorType: "SYSTEM", action: "PAYMENT_PROVIDER_OUTCOME_UNKNOWN", targetType: "PAYMENT", targetId: payment.id, outcome: "REVIEW", metadata: { providerId: input.providerId } },
      });
    });
    console.error("Provider payment outcome requires review", { providerId: input.providerId, paymentId: payment.id, errorType: error instanceof Error ? error.name : "UnknownError" });
    return { payment: { ...payment, status: PaymentStatus.REQUIRES_REVIEW }, providerRedirectUrl: null, replayed: false, uncertain: true };
  }
}

export async function getMerchantPayment(merchantId: string, paymentId: string) {
  return prisma.payment.findFirst({
    where: { merchantId, id: paymentId },
    select: { id: true, checkoutSessionId: true, amountMinor: true, currency: true, status: true, providerId: true, providerPaymentId: true, providerRedirectUrl: true, failureCode: true, createdAt: true, completedAt: true },
  });
}
