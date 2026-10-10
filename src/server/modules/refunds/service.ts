import "server-only";
import { PaymentStatus, RefundStatus } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AppError } from "@/server/shared/errors/app-error";

/**
 * Records a refund request for later provider execution.
 * This function does not claim money has been returned; only verified provider
 * confirmation may move the record to SUCCEEDED.
 */
export async function requestRefund(input: { merchantId: string; paymentId: string; amountMinor: string; currency: string; reason?: string; idempotencyKey: string }) {
  if (!/^[1-9]\d{0,17}$/.test(input.amountMinor)) throw new AppError("VALIDATION_ERROR", "Refund amount must be a positive integer in minor units.", 400);
  if (!/^[A-Za-z]{3}$/.test(input.currency)) throw new AppError("VALIDATION_ERROR", "Currency must be a three-letter code.", 400);
  if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 200) throw new AppError("VALIDATION_ERROR", "A valid idempotency key is required.", 400);

  const amount = BigInt(input.amountMinor);
  const payment = await prisma.payment.findFirst({ where: { id: input.paymentId, merchantId: input.merchantId }, select: { id: true, amountMinor: true, currency: true, status: true } });
  if (!payment) throw new AppError("NOT_FOUND", "Payment not found for this merchant.", 404);
  if (payment.status !== PaymentStatus.SUCCEEDED) throw new AppError("CONFLICT", "Only successful payments can be refunded.", 409);
  if (payment.currency !== input.currency.toUpperCase()) throw new AppError("VALIDATION_ERROR", "Refund currency must match the original payment.", 400);

  const existing = await prisma.refund.findUnique({ where: { merchantId_idempotencyKey: { merchantId: input.merchantId, idempotencyKey: input.idempotencyKey } } });
  if (existing) {
    if (existing.paymentId !== payment.id || existing.amountMinor !== amount) throw new AppError("CONFLICT", "Idempotency key was reused with different refund details.", 409);
    return existing;
  }

  const prior = await prisma.refund.aggregate({
    where: { paymentId: payment.id, status: { in: [RefundStatus.REQUESTED, RefundStatus.PENDING, RefundStatus.SUCCEEDED] } },
    _sum: { amountMinor: true },
  });
  if ((prior._sum.amountMinor ?? 0n) + amount > payment.amountMinor) throw new AppError("CONFLICT", "Refund amount exceeds the remaining refundable balance.", 409);

  return prisma.$transaction(async (tx) => {
    const refund = await tx.refund.create({
      data: { merchantId: input.merchantId, paymentId: payment.id, amountMinor: amount, currency: payment.currency, reason: input.reason?.trim().slice(0, 500), idempotencyKey: input.idempotencyKey, status: "REQUESTED" },
    });
    await tx.auditLog.create({ data: { actorType: "MERCHANT_API", actorId: input.merchantId, action: "REFUND_REQUESTED", targetType: "REFUND", targetId: refund.id, outcome: "SUCCESS", metadata: { amountMinor: amount.toString(), currency: payment.currency } } });
    return refund;
  });
}

export async function listMerchantRefunds(merchantId: string, take = 50) {
  return prisma.refund.findMany({ where: { merchantId }, orderBy: { createdAt: "desc" }, take: Math.min(Math.max(take, 1), 100), select: { id: true, paymentId: true, amountMinor: true, currency: true, status: true, reason: true, createdAt: true, completedAt: true } });
}
