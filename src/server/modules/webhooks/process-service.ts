import "server-only";
import { CheckoutStatus, PaymentAttemptStatus, PaymentStatus, ProviderEventStatus } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import { assertPaymentTransition, type InternalPaymentStatus } from "@/server/modules/payments/domain/payment-state";

/**
 * Process only the normalized event envelope produced by a verified provider adapter.
 * The operation is idempotent: already-processed events are not applied a second time.
 */
export async function processProviderEvent(eventRecordId: string) {
  const event = await prisma.providerEvent.findUnique({ where: { id: eventRecordId } });
  if (!event) throw new Error("Provider event not found.");
  if (event.status === ProviderEventStatus.PROCESSED || event.status === ProviderEventStatus.IGNORED) return event;

  await prisma.providerEvent.update({ where: { id: event.id }, data: { status: ProviderEventStatus.PROCESSING, lastError: null } });

  try {
    const payload = event.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      await prisma.providerEvent.update({ where: { id: event.id }, data: { status: ProviderEventStatus.IGNORED, processedAt: new Date() } });
      return null;
    }

    const normalized = payload as Record<string, unknown>;
    const internalPaymentId = normalized.internalPaymentId;
    const normalizedStatus = normalized.status;
    const providerPaymentId = normalized.providerPaymentId;

    // Provider-specific non-payment events can be acknowledged without mutating payment state.
    if (typeof internalPaymentId !== "string" || typeof normalizedStatus !== "string") {
      await prisma.providerEvent.update({ where: { id: event.id }, data: { status: ProviderEventStatus.IGNORED, processedAt: new Date() } });
      return null;
    }

    const statusMap: Record<string, PaymentStatus> = {
      PENDING: PaymentStatus.PROCESSING,
      REQUIRES_ACTION: PaymentStatus.REQUIRES_ACTION,
      SUCCEEDED: PaymentStatus.SUCCEEDED,
      FAILED: PaymentStatus.FAILED,
      CANCELED: PaymentStatus.CANCELED,
      UNKNOWN: PaymentStatus.REQUIRES_REVIEW,
    };
    const nextStatus = statusMap[normalizedStatus];
    if (!nextStatus) throw new Error("Unsupported normalized payment status.");

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id: internalPaymentId, providerId: event.providerId },
        select: { id: true, status: true, providerPaymentId: true, checkoutSessionId: true },
      });
      if (!payment) throw new Error("Payment/provider pair was not found.");
      if (typeof providerPaymentId === "string" && payment.providerPaymentId && payment.providerPaymentId !== providerPaymentId) {
        throw new Error("Provider payment reference did not match.");
      }

      assertPaymentTransition(payment.status as InternalPaymentStatus, nextStatus as InternalPaymentStatus);
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          providerPaymentId: typeof providerPaymentId === "string" ? providerPaymentId : payment.providerPaymentId,
          completedAt: nextStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        },
      });

      const attemptStatus = nextStatus === PaymentStatus.SUCCEEDED ? PaymentAttemptStatus.SUCCEEDED
        : nextStatus === PaymentStatus.FAILED || nextStatus === PaymentStatus.CANCELED ? PaymentAttemptStatus.FAILED
        : nextStatus === PaymentStatus.REQUIRES_REVIEW ? PaymentAttemptStatus.UNKNOWN
        : PaymentAttemptStatus.PROCESSING;
      await tx.paymentAttempt.updateMany({
        where: { paymentId: payment.id, providerId: event.providerId },
        data: { status: attemptStatus, providerPaymentId: typeof providerPaymentId === "string" ? providerPaymentId : undefined },
      });

      if (payment.checkoutSessionId && nextStatus === PaymentStatus.SUCCEEDED) {
        await tx.checkoutSession.update({ where: { id: payment.checkoutSessionId }, data: { status: CheckoutStatus.COMPLETED } });
      } else if (payment.checkoutSessionId && nextStatus === PaymentStatus.CANCELED) {
        await tx.checkoutSession.update({ where: { id: payment.checkoutSessionId }, data: { status: CheckoutStatus.CANCELED } });
      }

      await tx.auditLog.create({
        data: {
          actorType: "PROVIDER",
          actorId: event.providerId,
          action: "PROVIDER_PAYMENT_STATUS_APPLIED",
          targetType: "PAYMENT",
          targetId: payment.id,
          outcome: "SUCCESS",
          metadata: { providerEventId: event.providerEventId, status: nextStatus },
        },
      });
      await tx.providerEvent.update({ where: { id: event.id }, data: { status: ProviderEventStatus.PROCESSED, processedAt: new Date(), lastError: null } });
    });
    return prisma.providerEvent.findUnique({ where: { id: event.id } });
  } catch (error) {
    // Keep provider payloads and exception messages out of operational columns and logs.
    await prisma.providerEvent.update({
      where: { id: event.id },
      data: { status: ProviderEventStatus.FAILED, lastError: "NORMALIZED_EVENT_PROCESSING_FAILED" },
    });
    throw error;
  }
}
